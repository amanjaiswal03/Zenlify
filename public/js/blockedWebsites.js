export function initBlockedWebsitesListeners(){
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        console.log('test');
        chrome.storage.sync.get(['blockedWebsites'], ({ blockedWebsites }) => {
          if (blockedWebsites.includes(new URL(tab.url).hostname)) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs.length > 0) {
                chrome.tabs.update(tabId, { url: 'blocked.html' });
              }
            });
          }
        });
    });
}