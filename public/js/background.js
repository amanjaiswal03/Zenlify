chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.storage.sync.set({ blockedSites: [] });
  });
  

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get('blockedSites', ({ blockedSites }) => {
    if (blockedSites.includes(new URL(tab.url).hostname)) {
      chrome.tabs.remove(tabId);
    }
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the URL when clicked on the extension
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    chrome.storage.sync.set({ clickedUrl: url }); // Save the URL to storage
  });
});
