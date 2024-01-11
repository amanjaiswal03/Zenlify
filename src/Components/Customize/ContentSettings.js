import React, { useState, useEffect } from 'react';

function ContentSettings() {
    const [isHideWidgets, setIsHideWidgets] = useState(false);
    const [blockPopupsAndAds, setBlockPopupsAndAds] = useState(false);

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['isHideWidgets', 'blockPopupsAndAds'], ({ isHideWidgets, blockPopupsAndAds }) => {
            setIsHideWidgets(isHideWidgets);
            setBlockPopupsAndAds(blockPopupsAndAds);
        });
    }, []);

    useEffect(() => {
        // Code to run when isHideWidgets changes
        chrome.storage.sync.set({ isHideWidgets: isHideWidgets, blockPopupsAndAds: blockPopupsAndAds });
    }, [isHideWidgets, blockPopupsAndAds]);

    return (
        <div>
            <h1>Content Settings</h1>
            <label>
                Hide recommendation widgets from youtube:
                <input type="checkbox" checked={isHideWidgets} onChange={() => setIsHideWidgets(!isHideWidgets)} />
            </label>
            <br />
            <label>
                Block popups and common ads from websites:
                <input type="checkbox" checked={blockPopupsAndAds} onChange={() => setBlockPopupsAndAds(!blockPopupsAndAds)} />
            </label>
            <br />
        </div>
    );
}

export default ContentSettings;