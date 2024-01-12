import React, { useState, useEffect } from 'react';

function ContentSettings() {
    const [isHideWidgets, setIsHideWidgets] = useState(false);
    const [blockAds, setblockAds] = useState(false);

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['isHideWidgets', 'blockAds'], ({ isHideWidgets, blockAds }) => {
            setIsHideWidgets(isHideWidgets);
            setblockAds(blockAds);
        });
    }, []);

    useEffect(() => {
        // Code to run when isHideWidgets changes
        chrome.storage.sync.set({ isHideWidgets: isHideWidgets, blockAds: blockAds });
    }, [isHideWidgets, blockAds]);

    return (
        <div>
            <h1>Content Settings</h1>
            <label>
                Distraction free youtube (hide 'watch next' and ads):
                <input type="checkbox" checked={isHideWidgets} onChange={() => setIsHideWidgets(!isHideWidgets)} />
            </label>
            <br />
            <label>
                Block common ads from websites:
                <input type="checkbox" checked={blockAds} onChange={() => setblockAds(!blockAds)} />
            </label>
            <br />
        </div>
    );
}

export default ContentSettings;