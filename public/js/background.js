
let extensionEnabled = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedWebsites: [], isEnabled: true });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(['blockedWebsites', 'isEnabled'], ({ blockedWebsites, isEnabled }) => {
    if (isEnabled && blockedWebsites.includes(new URL(tab.url).hostname)) {
      chrome.tabs.update(tabId, { url: 'blocked.html' });
    }
  });
});

