// public/background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ blockedSites: [] });
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.storage.sync.get('blockedSites', ({ blockedSites }) => {
      if (blockedSites.includes(new URL(tab.url).hostname)) {
        chrome.tabs.remove(tabId);
      }
    });
  });
  