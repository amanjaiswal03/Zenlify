document.addEventListener('DOMContentLoaded', function() {
    let isEnabled = false;
    let url; // Declare url as a global variable

    const urlHostnameElement = document.getElementById('url-hostname');
    const blockSiteButton = document.getElementById('block-site-btn');
    const toggleExtensionButton = document.getElementById('toggle-extension-btn');
    const advancedOptionButton = document.getElementById('advanced-option-btn');

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

    chrome.storage.sync.get('isEnabled', (data) => {
        isEnabled = !!data.isEnabled;
        toggleExtensionButton.textContent = isEnabled ? 'Disable Extension' : 'Enable Extension';
    });

    blockSiteButton.addEventListener('click', function() {
        try {
            if (url){
                chrome.storage.sync.get('blockedWebsites', ({ blockedWebsites }) => {
                    if (!blockedWebsites.includes(url.hostname)) {
                        const updatedBlockedWebsites = [...blockedWebsites, url.hostname];
                        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });

                        //Reload current tab
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

    toggleExtensionButton.addEventListener('click', function() {
        isEnabled = !isEnabled;
        chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
            console.log(`Extension is ${isEnabled ? 'enabled' : 'disabled'}`);
            toggleExtensionButton.textContent = isEnabled ? 'Disable Extension' : 'Enable Extension';
            // Set badge text to ON or OFF
            chrome.action.setBadgeText({ text: isEnabled ? 'ON' : 'OFF' });
        });
    });

    advancedOptionButton.addEventListener('click', function() {
        // Open advanced options
        chrome.runtime.openOptionsPage();
    });
});
