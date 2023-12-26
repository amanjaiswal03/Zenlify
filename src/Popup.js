import React, { useState, useEffect } from 'react';

function Popup() {
    const [url, setUrl] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab) {
                setUrl(new URL(currentTab.url));
            }
        });

        chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
            setIsEnabled(isEnabled);
        });
    }, []);

    const toggleExtension = () => {
        const newIsEnabled = !isEnabled;
        setIsEnabled(newIsEnabled);
        chrome.storage.sync.set({ isEnabled: newIsEnabled }, () => {
            console.log(`Extension is ${newIsEnabled ? 'enabled' : 'disabled'}`);
            chrome.action.setBadgeText({ text: newIsEnabled ? 'ON' : 'OFF' });
        });
    };

    const blockSite = () => {
        try {
            chrome.storage.sync.get('blockedSites', ({ blockedSites }) => {
                if (!blockedSites.includes(url.hostname)) {
                    const updatedBlockedSites = [...blockedSites, url.hostname];
                    chrome.storage.sync.set({ blockedSites: updatedBlockedSites });
                } else {
                    console.log(`URL already blocked: ${url.hostname}`);
                }
            });
        } catch (error) {
            console.error('Invalid URL:', url.hostname);
        }
    };

    return (
        <div>
            <p><strong>You are currently on: </strong><br /> {url.protocol == "https:" ? url.hostname : 'No valid URL'}</p>
            <button onClick={blockSite} disabled={url.protocol !== "https:"}>Block Site</button>
            <button onClick={toggleExtension}>{isEnabled ? 'Disable Extension' : 'Enable Extension'}</button>
        </div>
    );
}

export default Popup;
