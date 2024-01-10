import React, { useState, useEffect } from 'react';

function ContentSettings() {
    const [isHideWidgets, setIsHideWidgets] = useState(false);

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['isHideWidgets'], ({ isHideWidgets }) => {
            setIsHideWidgets(isHideWidgets);
        });
    }, []);

    useEffect(() => {
        // Code to run when isHideWidgets changes
        chrome.storage.sync.set({ isHideWidgets: isHideWidgets});
    }, [isHideWidgets]);

    return (
        <div>
            <h1>Content Settings</h1>
            <label>
                Hide recommendation widgets from youtube:
                <input type="checkbox" checked={isHideWidgets} onChange={() => setIsHideWidgets(!isHideWidgets)} />
            </label>
        </div>
    );
}

export default ContentSettings;