/**
 * Initializes listeners for blocked websites.
 * Whenever a tab is updated, this function checks if the URL of the tab's page is in the list of blocked websites.
 * If it is, the tab's URL is updated to 'blocked.html'.
 */
export function initBlockedWebsitesListeners(){
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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