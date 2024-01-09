import { timerRunning, startTimer, resetTimer, pauseTimer, sendTimer, logAchievement } from './pomodoroTimer.js';
import { saveBrowsingHistory } from './browsingHistory.js';


// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true, maxTabs : 20});
});

let tabTimes = {};
let tabUrls = {};
let maxTabs = 20;

// Event listener for when a tab is activated (logs the time spent on the website)
chrome.tabs.onActivated.addListener(activeInfo => {
  const { tabId } = activeInfo;
  if (tabTimes[tabId]) {
    const timeSpent = Date.now() - tabTimes[tabId];
    
    chrome.tabs.get(tabId, tab => {
      saveBrowsingHistory(new URL(tab.url).hostname, timeSpent, true);
    });

    tabTimes[tabId] = Date.now();
  }
});

// Event listener for when a tab is removed (logs the time spent on the website)
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabTimes[tabId]) {
    const timeSpent = Date.now() - tabTimes[tabId];
    if (tabUrls[tabId]) {
      saveBrowsingHistory(tabUrls[tabId], timeSpent, false);
    }
    delete tabTimes[tabId];
    delete tabUrls[tabId];
  }
});



// Event listener for when a tab is updated (checks if the website is blocked or logs the time spent on the website)
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
        saveBrowsingHistory(new URL(tab.url).hostname, 0, true);
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

// Event listener for when a new tab is created (checks if the number of tabs exceeds the limit)
chrome.tabs.onCreated.addListener(() => {
  chrome.storage.sync.get('maxTabs', (result) =>
    chrome.tabs.query({currentWindow: true}, tabs => {
      if (tabs.length >= result.maxTabs) {
          chrome.tabs.remove(tabs[tabs.length - 1].id);
          chrome.notifications.create({
              type: 'basic',
              title: 'Unable to open new tab',
              iconUrl: '../images/zenlify_logo.png',
              message: 'Number of open tabs exceeds the allowed limit.',
          });
      }
  }));
});
  


