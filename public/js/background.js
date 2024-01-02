
let extensionEnabled = true;

// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true });
});

// Event listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(['blockedWebsites', 'isEnabled'], ({ blockedWebsites, isEnabled }) => {
    if (isEnabled && blockedWebsites.includes(new URL(tab.url).hostname)) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.update(tabId, { url: 'blocked.html' });
        }
      });
    }
  });
});

// Pomodoro timer variables
let countdown;
let timerDuration;
let timerRunning = false;
let onBreak = false;
let pomodoroDuration = 25 * 60; // default Pomodoro duration
let breakDuration = 5 * 60; // default break duration
let isPaused = false;
let pausedTime = 0;

// Event listener for messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  switch (msg.command) {
    case 'start':
      pomodoroDuration = msg.pomodoroDuration * 60 || pomodoroDuration;
      breakDuration = msg.breakDuration * 60 || breakDuration;
      startTimer(pomodoroDuration);
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
      response(timerRunning);
      break;
    default:
      console.error('Unrecognized command');
  }
});

// Function to start the timer
function startTimer(duration) {
  if (!timerRunning) {
    timerDuration = isPaused ? pausedTime : duration; // Start from paused time if timer was paused
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
      if (onBreak) {
        startTimer(breakDuration);
      } else {
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

// Function to send the timer to the popup
function sendTimer() {
  const minutes = Math.floor(timerDuration / 60);
  const seconds = timerDuration % 60;
  chrome.runtime.sendMessage({ minutes: minutes, seconds: seconds, onBreak: onBreak });
}

// Event listener for when the alarm goes off
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer' && timerRunning) {
    timerDuration--;
    if (timerDuration <= 0) {
      clearInterval(countdown);
      timerRunning = false;
      onBreak = !onBreak;
      const nextDuration = onBreak ? breakDuration : pomodoroDuration;
      startTimer(nextDuration);
    }
    sendTimer();
  }
});
