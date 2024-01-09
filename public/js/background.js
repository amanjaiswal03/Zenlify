import { timerRunning, startTimer, resetTimer, pauseTimer, sendTimer, logAchievement } from './pomodoroTimer.js';
import { saveBrowsingHistory } from './browsingHistory.js';


// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true});
});

let tabTimes = {};
let tabUrls = {};

// Event listener for when a tab is activated
chrome.tabs.onActivated.addListener(activeInfo => {
  const { tabId } = activeInfo;
  if (tabTimes[tabId]) {
    const timeSpent = Date.now() - tabTimes[tabId];
    
    chrome.tabs.get(tabId, tab => {
      saveBrowsingHistory(new URL(tab.url).hostname, timeSpent);
    });

    tabTimes[tabId] = Date.now();
  }
});

// Event listener for when a tab is removed
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabTimes[tabId]) {
    const timeSpent = Date.now() - tabTimes[tabId];
    if (tabUrls[tabId]) {
      saveBrowsingHistory(tabUrls[tabId], timeSpent);
    }
    delete tabTimes[tabId];
    delete tabUrls[tabId];
  }
});



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
      if (tabUrls[tabId] !== new URL(tab.url).hostname) {
        saveBrowsingHistory(new URL(tab.url).hostname, 0);
      }
      tabUrls[tabId] = new URL(tab.url).hostname;
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
    default:
      console.error('Unrecognized command');
  }
});



