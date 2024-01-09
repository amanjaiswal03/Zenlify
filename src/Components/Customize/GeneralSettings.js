import React, { useState, useEffect } from 'react';

function GeneralSettings() {
    const [maxTabs, setMaxTabs] = useState(20); // Default to 10 tabs

    useEffect(() => {
         chrome.storage.sync.set({ maxTabs: maxTabs });
    }, [maxTabs]);

    return (
        <div>
            <h2>General</h2>
            <label>
                Allowed number of open tabs :
                <input type="number" value={maxTabs} onChange={e => setMaxTabs(e.target.value)} />
            </label>
        </div>
    );
}

export default GeneralSettings;
