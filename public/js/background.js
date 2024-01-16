import { onBreak, timerRunning, startTimer, resetTimer, pauseTimer, sendTimer, logAchievement, openInputPage } from './pomodoroTimer.js';
import { saveBrowsingHistory } from './browsingHistory.js';



let tabTimes = {}; // Stores the timestamp when the user enters a website
let tabUrls = {}; // Stores the url of the website the user is currently on


// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true, maxTabs : 20, isHideWidgets: false, blockedKeywords: [], blockAds: false, googleSync: false });
  chrome.storage.sync.set({ pomodoroNotificationMessage: 'Your pomodoro session is over, take a well deserved break!', breakNotificationMessage: 'Your break is over, start a new session!' })
});

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

// Event listener for when the notification button is clicked
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

// Function to fetch and update rules for blocking popups and ads
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

// Event listener for changes in chrome storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.blockAds) {
    updateBlockAdsRules();
  }
});