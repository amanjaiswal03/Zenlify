
let extensionEnabled = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true });
});

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

//pomodoro timer
let countdown;
let timerDuration;
let timerRunning = false;
let onBreak = false;
let pomodoroDuration = 25 * 60; // default Pomodoro duration
let breakDuration = 5 * 60; // default break duration
let isPaused = false;
let pausedTime = 0;



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
    default:
      console.error('Unrecognized command');
  }
});

function startTimer(duration) {
  if (!timerRunning) {
    timerDuration = isPaused ? pausedTime : duration; // Start from paused time if timer was paused
    timerRunning = true;
    chrome.alarms.create('pomodoroTimer', { delayInMinutes: 1 / 60 });
    updateTimer();
  }
}

function updateTimer() {
  countdown = setInterval(() => {
    timerDuration--;
    if (timerDuration <= 0) {
      clearInterval(countdown);
      timerRunning = false;
      onBreak = !onBreak;
      startTimer(onBreak ? breakDuration : pomodoroDuration);
    }
    sendTimer();
  }, 1000);
}

function resetTimer() {
  clearInterval(countdown);
  timerRunning = false;
  onBreak = false;
  timerDuration = pomodoroDuration;
  sendTimer();
}
function pauseTimer() {
  if (timerRunning) {
    clearInterval(countdown);
    timerRunning = false;
    isPaused = true;
    pausedTime = timerDuration;
    sendTimer();
  }
}

function sendTimer() {
  const minutes = Math.floor(timerDuration / 60);
  const seconds = timerDuration % 60;
  chrome.runtime.sendMessage({ minutes: minutes, seconds: seconds, onBreak: onBreak });
}

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
