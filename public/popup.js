// Event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    let currentUrl; // Declare currentUrl as a global variable

    // Get elements from the DOM
    const urlHostnameElement = document.getElementById('url-hostname');
    const blockSiteButton = document.getElementById('block-site-btn');
    const advancedOptionButton = document.getElementById('advanced-option-btn');

    // Pomodoro timer elements
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const timerDisplay = document.getElementById('time');
    const pomodoroDurationInput = document.getElementById('pomodoroDuration');
    const breakDurationInput = document.getElementById('breakDuration');
    const timerTitle = document.getElementById('timer-title');

    let isTimerRunning = false; 
    timerDisplay.textContent = `${pomodoroDurationInput.value ? pomodoroDurationInput.value : '25'}:00`; // Set the initial timer display

    function formatTimeDisplay(minutes, seconds) {
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function sendMessageToBackgroundScript(command, pomodoroDuration, breakDuration, callback) {
        chrome.runtime.sendMessage({ command, pomodoroDuration, breakDuration }, callback);
    }

    
    function requestTimerUpdate() {
        sendMessageToBackgroundScript('getTimer');
    }

    // Check if the timer is running when the popup is opened
    sendMessageToBackgroundScript('isRunning', null, null, (response) => {
        startButton.textContent = response ? 'Pause' : 'Start';
        isTimerRunning = response;
    });

    // Get breakTime from storage and update timer title if it exists
    chrome.storage.sync.get(['breakTime'], ({ breakTime }) => {
        if (breakTime) {
            timerTitle.textContent = 'Break Session';
        }
    });

    startButton.addEventListener('click', function() {
        const pomodoroDuration = parseInt(pomodoroDurationInput.value) || 25;
        const breakDuration = parseInt(breakDurationInput.value) || 5;

        if (isTimerRunning) {
            // Pause the timer
            sendMessageToBackgroundScript('pause');
            startButton.textContent = 'Start';
        } else {
            // Start the timer
            sendMessageToBackgroundScript('start', pomodoroDuration, breakDuration);
            startButton.textContent = 'Pause';
        }
        isTimerRunning = !isTimerRunning; // Toggle the timer running flag
    });

    resetButton.addEventListener('click', function() {
        const pomodoroDuration = parseInt(pomodoroDurationInput.value) || 25;
        const breakDuration = parseInt(breakDurationInput.value) || 5;

        // Reset the timer
        sendMessageToBackgroundScript('reset', pomodoroDuration, breakDuration);
        startButton.textContent = 'Start';
        timerTitle.textContent = 'Focus Session';
        isTimerRunning = false;
    });

    // Update timer display when receiving message from background script
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if (msg.minutes != undefined && msg.seconds != undefined) {
            timerDisplay.textContent = formatTimeDisplay(msg.minutes, msg.seconds);
        }
        response('Timer updated');
    });

    requestTimerUpdate();
    setInterval(requestTimerUpdate, 1000);

    // Initialize URL and buttons
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab) {
            currentUrl = new URL(currentTab.url);
            if (currentUrl.protocol === "https:") {
                urlHostnameElement.textContent = currentUrl.hostname;
                blockSiteButton.disabled = false;
            }
        }
    });

    blockSiteButton.addEventListener('click', function() {
        if (currentUrl){
            chrome.storage.sync.get('blockedWebsites', ({ blockedWebsites }) => {
                if (!blockedWebsites.includes(currentUrl.hostname)) {
                    const updatedBlockedWebsites = [...blockedWebsites, currentUrl.hostname];
                    chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });

                    // Reload current tab
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentTab = tabs[0];
                        chrome.tabs.reload(currentTab.id);
                    });
                    
                } else {
                    console.log(`URL already blocked: ${currentUrl.hostname}`);
                }
            });
        }
    });

    advancedOptionButton.addEventListener('click', function() {
        // Open advanced options
        chrome.runtime.openOptionsPage();
    });
});