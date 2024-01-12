

// Pomodoro timer variables
let countdown;
let timerDuration;
let timerRunning = false;
let onBreak = false;
let pomodoroDuration = 25 * 60; // default Pomodoro duration
let breakDuration = 5 * 60; // default break duration
let isPaused = false;
let pausedTime = 0;
let startDate;
let endTime;
let startTime;
let totalTimeElapsed;

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
    startDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });;
    endTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    startTime = new Date(new Date().getTime() - (pomodoroDuration * 1000)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    totalTimeElapsed = new Date(pomodoroDuration * 1000).toISOString().slice(11, 19);
}

// Function to log the achievement
function logAchievement(achievement) {
  
  // Save the data to Chrome storage
  chrome.storage.sync.get('focusSessionData', (result) => {
    let focusSessionData = Array.isArray(result.focusSessionData) ? result.focusSessionData : [];
    
    const data = {
      startDate: startDate,
      startTime: startTime,
      endTime: endTime,
      totalTimeElapsed: totalTimeElapsed,
      achievement: achievement
    };
    focusSessionData.push(data);
    chrome.storage.sync.set({ ['focusSession-'+ startDate]: focusSessionData }, () => {
      if (chrome.runtime.lastError) {
        // Handle error
        console.log(chrome.runtime.lastError.message);
      } else {
        console.log('Achievement data saved to Chrome storage.');
      }
    });
  })
}


// Function to send the timer to the popup
function sendTimer() {
  const minutes = Math.floor(timerDuration / 60);
  const seconds = timerDuration % 60;
  chrome.runtime.sendMessage({ minutes: minutes, seconds: seconds, onBreak: onBreak }, function(response) {
    if (chrome.runtime.lastError) {
      // Handle error
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
    }, (notificationId) => {
      // Event listener for when the notification button is clicked
      chrome.notifications.onButtonClicked.addListener((clickedNotificationId, buttonIndex) => {
        if (clickedNotificationId === notificationId && buttonIndex === 0) {
          if (!onBreak) {
            // Handle "Finish Timer" button click
            resetTimer();
            
          } else {
            // Handle "Start Break" button click
            openInputPage();
            startTimer();
          }
        }
      });
    });
  });
}


//export this to background.js
export {pomodoroDuration, breakDuration, timerRunning, startTimer, resetTimer, pauseTimer, logAchievement, sendTimer};