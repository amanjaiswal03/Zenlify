

let extensionEnabled = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.storage.sync.set({ blockedSites: [], isEnabled: true });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get(['blockedSites', 'isEnabled'], ({ blockedSites, isEnabled }) => {
    if (isEnabled && blockedSites.includes(new URL(tab.url).hostname)) {
      chrome.tabs.update(tabId, { url: 'blocked.html' });
    }
  });
});

