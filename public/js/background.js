import { timerRunning, startTimer, resetTimer, pauseTimer, sendTimer, logAchievement } from './pomodoroTimer.js';

// Define an array to store browsing history
let browsingHistory = [];

// Function to save browsing history
const saveBrowsingHistory = (website, timeSpent) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const existingEntry = browsingHistory.find(entry => entry.date===formattedDate && entry.website === website);

  let formattedTimeSpent;

  if (existingEntry) {
    existingEntry.timesVisited++;
    existingEntry.timeSpent += timeSpent;
    existingEntry.formattedtimeSpent = formatTime(existingEntry.timeSpent);
    existingEntry.date = formattedDate;
  } else {
    browsingHistory.push({ website, timesVisited: 1, timeSpent, formattedTimeSpent, date: formattedDate });
  }

  // Save browsing history to chrome storage
  chrome.storage.sync.set({ browsingHistory });
};

// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true, browsingHistory: [] });
});

let tabTimes = {};

// Event listener for when a tab is activated
chrome.tabs.onActivated.addListener(activeInfo => {
  const { tabId } = activeInfo;
  if (tabTimes[tabId]) {
    const timeSpent = Date.now() - tabTimes[tabId];
    
    chrome.tabs.get(tabId, tab => {
      saveBrowsingHistory(new URL(tab.url).hostname, timeSpent);
    });
  }
});

// Function to format time in HH:MM:SS format
const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  return formattedTime;
};

// Function to pad zero for single-digit numbers
const padZero = (number) => {
  return number.toString().padStart(2, '0');
};

// Event listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('test');
  chrome.storage.sync.get(['blockedWebsites', 'isEnabled'], ({ blockedWebsites, isEnabled }) => {
    if (isEnabled && blockedWebsites.includes(new URL(tab.url).hostname)) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.update(tabId, { url: 'blocked.html' });
        }
      });
    } else if (changeInfo.status === 'complete' && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
      // Store the timestamp when the user enters the website
      tabTimes[tabId] = Date.now();
      saveBrowsingHistory(new URL(tab.url).hostname, 0);
    }
  });
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
    case 'getBrowsingHistory':
      sendResponse(browsingHistory);
      break;
    default:
      console.error('Unrecognized command');
  }
});



