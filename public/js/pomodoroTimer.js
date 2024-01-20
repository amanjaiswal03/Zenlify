

// Pomodoro timer variables
let countdown;
let timerDuration;
let timerRunning = false;
let onBreak = false;
let pomodoroDuration = 25 * 60; // default Pomodoro duration
let breakDuration = 5 * 60; // default break duration
let isPaused = false;
let pausedTime = 0;
let startDateTime;
let endDateTime;
let startDate;
let endTime;
let startTime;
let totalTimeElapsed;
let timezoneArea;

// Function to start the timer
function startTimer(newPomodoroDuration = pomodoroDuration, newBreakDuration = breakDuration) {
    pomodoroDuration = newPomodoroDuration;
    breakDuration = newBreakDuration;
    timerDuration = pomodoroDuration;
    timerDuration = onBreak ? breakDuration : timerDuration;
    if (!timerRunning) {
        timerDuration = isPaused ? pausedTime : timerDuration; // Start from paused time if timer was paused
        console.log(timerDuration);
        timerRunning = true;
        isPaused = false;
        chrome.alarms.create('pomodoroTimer', { delayInMinutes: 1 / 60 });
        updateTimer();
    }
}

// Function to update the timer every second
function updateTimer() {
  countdown = setInterval(() => {
    timerDuration--;
    if (timerDuration <= 0) {
      clearInterval(countdown);
      timerRunning = false;
      onBreak = !onBreak;
      displayNotification();
      if (!onBreak) {
        resetTimer(); // Reset the timer when the break time is finished
      }
    }
    sendTimer();
  }, 1000);
}

// Function to reset the timer
function resetTimer() {
  clearInterval(countdown);
  timerRunning = false;
  onBreak = false;
  isPaused = false;
  timerDuration = pomodoroDuration;
  chrome.storage.sync.set({ breakTime: false });
  sendTimer();
}

// Function to pause the timer
function pauseTimer() {
  if (timerRunning) {
    clearInterval(countdown);
    timerRunning = false;
    isPaused = true;
    pausedTime = timerDuration;
    sendTimer();
  }
}

//function to open achievement input page
function openInputPage() {
  chrome.windows.create({ url: 'input.html', type: 'popup', width: 500, height: 600 });
  
  const timezoneOffset = - new Date().getTimezoneOffset();
  const timezoneHour = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
  const timezoneMinute = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
  const timezoneSign = timezoneOffset < 0 ? '-' : '+';
  const timezone = `${timezoneSign}${timezoneHour}:${timezoneMinute}`;


  startDateTime = new Date(new Date().getTime() - (pomodoroDuration * 1000) + timezoneOffset * 60 * 1000).toISOString().split('.')[0] + timezone;
  endDateTime = new Date(new Date().getTime() + timezoneOffset * 60 * 1000).toISOString().split('.')[0] + timezone;
  startDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });;
  endTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  startTime = new Date(new Date().getTime() - (pomodoroDuration * 1000)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  totalTimeElapsed = new Date(pomodoroDuration * 1000).toISOString().slice(11, 19);
  timezoneArea = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(timezone);
  chrome.storage.sync.get(`focusSession-${startDate}`, (result) => {
    console.log(result);
  });
}

// Function to log the achievement
function logAchievement(achievement) {

  console.log("plEASE!!!!")
  // Open or create the database
  const openRequest = indexedDB.open("focusSessionHistoryDB", 2);

  openRequest.onupgradeneeded = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('focusSessionHistory')) {
      db.createObjectStore('focusSessionHistory', { keyPath: ['startDate', 'startTime'] });
    }
  };

  openRequest.onsuccess = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('focusSessionHistory')) {
      console.log(`No object store: focusSessionHistory`);
      return;
    }
    const transaction = db.transaction(['focusSessionHistory'], 'readwrite');
    const objectStore = transaction.objectStore('focusSessionHistory');
    const data = {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      startDate: startDate,
      startTime: startTime,
      endTime: endTime,
      totalTimeElapsed: totalTimeElapsed,
      achievement: achievement,
      timezoneArea: timezoneArea
    };
    objectStore.add(data);
    console.log(objectStore);

    transaction.oncomplete = function() {
      console.log("All data has been saved to IndexedDB");
      chrome.storage.sync.get('googleSync', function(result) {
        if (result.googleSync) {
          addFocusSessionToCalendar(data);
        }
      });
    };
  };

  openRequest.onerror = function(e) {
    console.log("Error", e.target.error.name);
  };
};

function addFocusSessionToCalendar(session) {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
      return;
    }

    const event = {
      'summary': 'Focus Session',
      'description': session.achievement,
      'start': {
        'dateTime': session.startDateTime,
        'timeZone': session.timezoneArea,
      },
      'end': {
        'dateTime': session.endDateTime,
        'timeZone': session.timezoneArea,
      },
    };
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).then(response => response.json())
    .then(data => {
        console.log('Event created: ' + data.htmlLink);
    })
    .catch(error => console.error('Error:', error));
  });

}


// Function to send the timer to the popup
function sendTimer() {
  const minutes = Math.floor(timerDuration / 60);
  const seconds = timerDuration % 60;
  chrome.runtime.sendMessage({ minutes: minutes, seconds: seconds, onBreak: onBreak }, (response) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  });
}



// Function to display a notification when the timer is finished
function displayNotification() {

  chrome.storage.sync.get(['pomodoroNotificationMessage', 'breakNotificationMessage'], (result) => {
    const buttonTitle = onBreak ? 'Start Break' : 'Finish session';
    chrome.notifications.create('pomodoroNotification', {
      type: 'basic',
      iconUrl: '../images/zenlify_logo.png',
      title: 'Pomodoro Timer',
      message: onBreak ? result.pomodoroNotificationMessage : result.breakNotificationMessage,
      buttons: [
        { title: buttonTitle }
      ],
      requireInteraction: true, // Prevent the notification from disappearing until the user clicks on the button
      priority: 2
    });
  });
}

export function initPomodoroTimerListeners(){
  // FEATURE: Pomodoro Timer event listeners

  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'pomodoroNotification' && buttonIndex === 0) {
      if (!onBreak) {
        // Handle "Finish Timer" button click
        resetTimer();
        
      } else {
        // Handle "Start Break" button click
        chrome.storage.sync.set({ breakTime: true });
        openInputPage();
        startTimer();
      }
    }
  });

  // Event listener for messages from the pomodoro timer
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.command) {
      case 'start':
        startTimer(msg.pomodoroDuration * 60, msg.breakDuration * 60);
        break;
      case 'reset':
        resetTimer();
        break;
      case 'pause':
        pauseTimer();
        break;
      case 'getTimer':
        sendTimer();
        break;
      case 'isRunning':
        sendResponse(timerRunning);
        break;
      case 'inputData':
        logAchievement(msg.achievement);
        sendResponse({ status: 'success' });
        break;
      default:
        console.error('Unrecognized command');
    }
  });
}

