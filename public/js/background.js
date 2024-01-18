import { onBreak, timerRunning, startTimer, resetTimer, pauseTimer, sendTimer, logAchievement, openInputPage } from './pomodoroTimer.js';
import { saveBrowsingHistory } from './browsingHistory.js';


// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true, maxTabs : 20, isHideWidgets: false, blockedKeywords: [], blockAds: false, googleSync: false });
  chrome.storage.sync.set({ pomodoroNotificationMessage: 'Your pomodoro session is over, take a well deserved break!', breakNotificationMessage: 'Your break is over, start a new session!' })
});

// FEATURE: browsing history with timespent event listeners
let currentTab;
let startTime;

function calculateTimeSpent(tab, newVisit) {
  if (tab && startTime && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
    const endTime = Date.now();
    const timeSpent = endTime - startTime;
    saveBrowsingHistory(new URL(tab.url).hostname, timeSpent, newVisit);
    console.log(`Time spent on ${tab.url}: ${timeSpent} ms`);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
    calculateTimeSpent(currentTab, false);
    currentTab = tab;
    startTime = Date.now();
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    calculateTimeSpent(currentTab, true);
    currentTab = tab;
    startTime = Date.now();
  });
});

chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'active') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (tabs.length > 0) {
        calculateTimeSpent(currentTab, false);
        currentTab = tabs[0];
        startTime = Date.now();
      }
    });
  } else if (['idle', 'locked'].includes(newState)) {
    calculateTimeSpent(currentTab);
    currentTab = null;
    startTime = null;
  }
});

// FEATURE: blocked websites event listeners

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('test');
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


// FEATURE: Pomodoro Timer event listeners

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'pomodoroNotification' && buttonIndex === 0) {
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

// FEATURE: Max number of tabs event listener

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

// FEATURE: Block ads event listener

function updateBlockAdsRules() {
  fetch('../rules/blockAds.json')
    .then(response => response.json())
    .then(rules => {
      const ruleIds = rules.map(rule => rule.id);

      chrome.storage.sync.get('blockAds', function(result) {
        if (result.blockAds) {
          chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules
          });
        } else {
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds
          });
        }
      });
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.blockAds) {
    updateBlockAdsRules();
  }
});