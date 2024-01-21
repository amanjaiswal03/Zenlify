// Timer State Configuration
// Contains the current state and configuration of the Pomodoro timer
let timerState = {
  countdown: null,
  timerDuration: 25 * 60, // Timer duration in seconds
  timerRunning: false, // Indicates if the timer is active
  onBreak: false, // Flag to check if it's currently a break period
  pomodoroDuration: 25 * 60, // Default Pomodoro duration in seconds (25 minutes)
  breakDuration: 5 * 60, // Default break duration in seconds (5 minutes)
  isPaused: false, // Indicates if the timer is paused
  pausedTime: 0 // Time remaining when the timer was paused
};

// Session Data
// Stores details about the current Pomodoro session
let session = {
  startDateTime: null,
  endDateTime: null,
  startDate: null,
  endTime: null,
  startTime: null,
  totalTimeElapsed: null,
  timezoneArea: null,
  achievement: null // Stores user-defined achievements
};

// Function to start or resume the Pomodoro timer
function startTimer(newPomodoroDuration = timerState.pomodoroDuration, newBreakDuration = timerState.breakDuration) {
  Object.assign(timerState, {
    pomodoroDuration: newPomodoroDuration,
    breakDuration: newBreakDuration,
    timerDuration: timerState.onBreak ? timerState.breakDuration : timerState.pomodoroDuration,
  });
  if (!timerState.timerRunning) {
    timerState.timerRunning = true;
    timerState.timerDuration = timerState.isPaused ? timerState.pausedTime : timerState.timerDuration;
    timerState.isPaused = false;
    chrome.alarms.create('pomodoroTimer', { delayInMinutes:   1 / 60 });
    updateTimer();
  }
}

// Function to update the timer every second and switch between work/break periods
function updateTimer() {
  timerState.countdown = setInterval(() => {
    timerState.timerDuration--;
    if (timerState.timerDuration <= 0) {
      clearInterval(timerState.countdown);
      toggleBreak();
    }
    sendTimerState();
  }, 1000);
}

// Function to toggle between work and break periods
function toggleBreak() {
  Object.assign(timerState, {
    timerRunning: false,
    onBreak: !timerState.onBreak,
  });
  displayNotification();
  if (!timerState.onBreak) resetTimer();
  
}

// Function to reset the timer to its initial state
function resetTimer(pomodoroDuration = timerState.pomodoroDuration, breakDuration = timerState.breakDuration) {
  clearInterval(timerState.countdown);
  Object.assign(timerState, {
    pomodoroDuration: pomodoroDuration,
    breakDuration: breakDuration,
    timerRunning: false,
    onBreak: false,
    isPaused: false,
    timerDuration: pomodoroDuration,
  });
  chrome.storage.sync.set({ breakTime: false });
  sendTimerState();
}

// Function to pause the timer and preserve the current state
function pauseTimer() {
  if (timerState.timerRunning) {
    clearInterval(timerState.countdown);
    Object.assign(timerState, {
      timerRunning: false,
      isPaused: true,
      pausedTime: timerState.timerDuration,
    });
    sendTimerState();
  }
}

// Function to send the current timer to the popup or dashboard
function sendTimerState() {
  const minutes = Math.floor(timerState.timerDuration / 60);
  const seconds = timerState.timerDuration % 60;
  chrome.runtime.sendMessage({ minutes: minutes, seconds: seconds, onBreak: timerState.onBreak }, (response) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  });
}



// Function to display a notification when a Pomodoro or break period ends
function displayNotification() {
  chrome.storage.sync.get(['pomodoroNotificationMessage', 'breakNotificationMessage'], (result) => {
    const buttonTitle = timerState.onBreak ? 'Start Break' : 'Finish session';
    chrome.notifications.create('pomodoroNotification', {
      type: 'basic',
      iconUrl: '../images/zenlify_logo.png',
      title: 'Pomodoro Timer',
      message: timerState.onBreak ? result.pomodoroNotificationMessage : result.breakNotificationMessage,
      buttons: [
        { title: buttonTitle }
      ],
      requireInteraction: true, // Prevent the notification from disappearing until the user clicks on the button
      priority: 2
    });
  });
}
  
//function to open achievement input page
function openInputPage() {
  chrome.windows.create({ url: 'input.html', type: 'popup', width: 500, height: 600 });
  
  const timezoneOffset = - new Date().getTimezoneOffset();
  const timezoneHour = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
  const timezoneMinute = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
  const timezoneSign = timezoneOffset < 0 ? '-' : '+';
  const timezone = `${timezoneSign}${timezoneHour}:${timezoneMinute}`;


  session.startDateTime = new Date(new Date().getTime() - (timerState.pomodoroDuration * 1000) + timezoneOffset * 60 * 1000).toISOString().split('.')[0] + timezone;
  session.endDateTime = new Date(new Date().getTime() + timezoneOffset * 60 * 1000).toISOString().split('.')[0] + timezone;
  session.startDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });;
  session.endTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  session.startTime = new Date(new Date().getTime() - (timerState.pomodoroDuration * 1000)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  session.totalTimeElapsed = new Date(timerState.pomodoroDuration * 1000).toISOString().slice(11, 19);
  session.timezoneArea = Intl.DateTimeFormat().resolvedOptions().timeZone;
}
  
  
// Function to log a user-defined achievement
function logAchievement(achievement) {
  // update the session object with achievement and log the session in the IndexedDB and 
  session.achievement = achievement;
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
    objectStore.add(session);

    transaction.oncomplete = function() {
      console.log("All data has been saved to IndexedDB");

      //check if user wants to sync with google calendar
      chrome.storage.sync.get('googleSync', function(result) {
        if (result.googleSync) {
          addFocusSessionToCalendar();
        }
      });
    };
  };

  openRequest.onerror = function(e) {
    console.log("Error", e.target.error.name);
  };
};

// Function to add the focus session to Google Calendar
function addFocusSessionToCalendar() {

    // get the access token and add the session to the calendar
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


// Initializes event listeners for the Pomodoro timer
function initPomodoroTimerListeners(){
  
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'pomodoroNotification' && buttonIndex === 0) {
      if (!timerState.onBreak) {
        // Handle "Finish Timer" button click
        resetTimer();
        
      } else {
        // Handle "Start Break" button click
        chrome.storage.sync.set({ breakTime: true });
        openInputPage();
        pauseTimer();
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
        resetTimer(msg.pomodoroDuration * 60, msg.breakDuration * 60);
        break;
      case 'pause':
        pauseTimer();
        break;
      case 'getTimer':
        sendTimerState();
        break;
      case 'isRunning':
        sendResponse(timerState.timerRunning);
        break;
      case 'inputData':
        logAchievement(msg.achievement);
        startTimer();
        sendResponse({ status: 'success' });
        break;
      default:
        console.error('Unrecognized command');
    }
  });
}

export { timerState, session, startTimer, updateTimer, toggleBreak, resetTimer, pauseTimer, sendTimerState, displayNotification, openInputPage, logAchievement, addFocusSessionToCalendar, initPomodoroTimerListeners}