const saveBrowsingHistory = (website, timeSpent, visited) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTimeSpent = timeSpent ? formatTime(timeSpent) : "00:00:00";

  // Open or create the database
  const openRequest = indexedDB.open("browsingHistoryDB", 1);

  openRequest.onupgradeneeded = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('browsingHistory')) {
      db.createObjectStore('browsingHistory', { keyPath: ['formattedDate', 'website'] });
    }
  };

  openRequest.onsuccess = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('browsingHistory')) {
      console.log(`No object store: browsingHistory`);
      return;
  }
    const transaction = db.transaction(['browsingHistory'], 'readwrite');
    const objectStore = transaction.objectStore('browsingHistory');
    let matched = false;
    
    const request = objectStore.getAll(IDBKeyRange.only([formattedDate, website]));

    request.onsuccess = function(event) {
      console.log(event);
      const results = event.target.result;
      console.log(results);

      // Perform operations on the results
      results.forEach(data => {
        if (data.website === website) {
          matched = true;
          // Update the time spent on the website
          if (visited) {
            data.timesVisited++;
          }
          data.timeSpent += timeSpent;
          data.formattedTimeSpent = formatTime(data.timeSpent);
          objectStore.put(data);
          console.log("matched")
        }  
      });
      if (!matched) {
        // Add the new website to the database
        const data = {
          website: website,
          timesVisited: 1,
          timeSpent: timeSpent,
          formattedTimeSpent: formattedTimeSpent,
          formattedDate: formattedDate
        };
        objectStore.add(data);
      }
    };

    transaction.oncomplete = function() {
      console.log("All data has been saved to IndexedDB");
    };
  };

  openRequest.onerror = function(e) {
    console.log("Error", e.target.error.name);
  };
};


// Function to format time in HH:MM:SS format
const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
    return formattedTime;
};
  
// Function to pad zero for single-digit numbers
const padZero = (number) => {
    return number.toString().padStart(2, '0');
};

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

export function initBrowsingHistoryListeners(){
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
}
