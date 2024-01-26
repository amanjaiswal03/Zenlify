import { initPomodoroTimerListeners } from './pomodoroTimer.js';
import { initBrowsingHistoryListeners} from './browsingHistory.js';
import { initBlockedWebsitesListeners } from './blockedWebsites.js';
import { initMaxTabsListeners } from './maxTabs.js';
import { initUpdateBlockAdsRulesListener } from './blockAds.js';


// Event listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blockedWebsites: [], blockedWebsitesFocus: [], maxTabs : 20, isHideWidgets: false, blockedKeywords: [], blockAds: false, googleSync: false, breakTime: false });
  chrome.storage.sync.set({ pomodoroNotificationMessage: 'Your pomodoro session is over, take a well deserved break!', breakNotificationMessage: 'Your break is over, start a new session!' })
});

initPomodoroTimerListeners();
initBrowsingHistoryListeners();
initBlockedWebsitesListeners();
initMaxTabsListeners();
initUpdateBlockAdsRulesListener();