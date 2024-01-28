/**
 * Initializes listeners for maximum tabs functionality.
 * When a new tab is created, checks if the number of open tabs exceeds the allowed limit.
 * If so, removes the latest tab and displays a notification.
 */

export function initMaxTabsListeners(){
  chrome.tabs.onCreated.addListener(() => {
    chrome.storage.sync.get("maxTabs", (result) =>
      chrome.tabs.query({currentWindow: true}, tabs => {
        if (tabs.length > result.maxTabs) {
          chrome.tabs.remove(tabs[tabs.length - 1].id);
          chrome.notifications.create({
            type: "basic",
            title: "Unable to open new tab",
            iconUrl: "../images/zenlify_logo.png",
            message: "Number of open tabs exceeds the allowed limit.",
          });
        }
      }));
  });
}
