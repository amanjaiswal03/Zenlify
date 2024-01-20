// Event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    let url; // Declare url as a global variable

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

    let isTimerRunning = false; // Add a flag to track if the timer is running
    timerDisplay.textContent = `${pomodoroDurationInput.value ? pomodoroDurationInput.value : '25'}:00`; // Set the initial timer display

    // Check if the timer is running when the popup is opened
    chrome.runtime.sendMessage({ command: 'isRunning' }, (response) => {
        console.log(response);
        if (response) {
            startButton.textContent = 'Pause'; // Set the button text to 'Pause'
            isTimerRunning = true; // Set the timer running flag to true
        } else {
            startButton.textContent = 'Start'; // Set the button text to 'Start'
            isTimerRunning = false; // Set the timer running flag to false
        }
    });

    chrome.storage.sync.get(['breakTime'], ({ breakTime }) => {
        if (breakTime) {
            timerTitle.textContent = 'Break Session';
        }
    });


    // Event listener for start button
    startButton.addEventListener('click', function() {
        if (isTimerRunning) {
            // Pause the timer
            chrome.runtime.sendMessage({ command: 'pause' });
            startButton.textContent = 'Start'; // Change the button text to 'Start'
        } else {
            // Start the timer
            const pomodoroDuration = parseInt(pomodoroDurationInput.value) || 25;
            const breakDuration = parseInt(breakDurationInput.value) || 5;
            chrome.runtime.sendMessage({ command: 'start', pomodoroDuration, breakDuration });
            startButton.textContent = 'Pause'; // Change the button text to 'Pause'
        }
        isTimerRunning = !isTimerRunning; // Toggle the timer running flag
    });

    // Event listener for reset button
    resetButton.addEventListener('click', function() {
        const pomodoroDuration = parseInt(pomodoroDurationInput.value) || 25;
        const breakDuration = parseInt(breakDurationInput.value) || 5;
        chrome.runtime.sendMessage({ command: 'reset', pomodoroDuration, breakDuration });
        startButton.textContent = 'Start'; // Reset the button text to 'Start'
        timerTitle.textContent = 'Focus Session';
        isTimerRunning = false; // Reset the timer running flag
    });

    // Function to request timer update from background script
    function requestTimerUpdate() {
        chrome.runtime.sendMessage({ command: 'getTimer' });
    }

    // Update timer display when receiving message from background script
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if (msg.minutes != undefined && msg.seconds != undefined) {
            timerDisplay.textContent = `${msg.minutes < 10 ? '0' : ''}${msg.minutes}:${msg.seconds < 10 ? '0' : ''}${msg.seconds}`;
        }
        response('Timer updated');
    });

    requestTimerUpdate();
    setInterval(requestTimerUpdate, 1000);

    // End of Pomodoro timer

    // Initialize URL and buttons
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab) {
            url = new URL(currentTab.url);
            if (url.protocol === "https:") {
                urlHostnameElement.textContent = url.hostname;
                blockSiteButton.disabled = false;
            }
        }
    });

    // Event listener for block site button
    blockSiteButton.addEventListener('click', function() {
        try {
            if (url){
                chrome.storage.sync.get('blockedWebsites', ({ blockedWebsites }) => {
                    if (!blockedWebsites.includes(url.hostname)) {
                        const updatedBlockedWebsites = [...blockedWebsites, url.hostname];
                        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });

                        // Reload current tab
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            const currentTab = tabs[0];
                            chrome.tabs.reload(currentTab.id);
                        });
                        
                    } else {
                        console.log(`URL already blocked: ${url.hostname}`);
                    }
                });
            }
        } catch (error) {
            console.error('Invalid URL:', url.hostname);
        }
    });


    // Event listener for advanced option button
    advancedOptionButton.addEventListener('click', function() {
        // Open advanced options
        chrome.runtime.openOptionsPage();
    });
});
