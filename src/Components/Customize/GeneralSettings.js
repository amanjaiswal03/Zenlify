import React, { useState, useEffect } from 'react';

function GeneralSettings() {
    const [maxTabs, setMaxTabs] = useState();
    const [restTime, setRestTime] = useState();
    const [isRestTimeEnabled, setIsRestTimeEnabled] = useState();


    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['maxTabs', 'restTime', 'isRestTimeEnabled'], ({ maxTabs, restTime, isRestTimeEnabled }) => {
            setMaxTabs(maxTabs);
            setRestTime(restTime);
            setIsRestTimeEnabled(isRestTimeEnabled);
        });
    }, []);

    useEffect(() => {
        chrome.storage.sync.set({ maxTabs: maxTabs });
    }, [maxTabs]);

    useEffect(() => {
        chrome.storage.sync.set({ restTime: restTime });
        if (isRestTimeEnabled){
            chrome.runtime.sendMessage({command: 'setRestTimer', restTime: restTime});
        }
    }, [restTime]);

    useEffect(() => {
        chrome.storage.sync.set({ isRestTimeEnabled: isRestTimeEnabled });
        if (isRestTimeEnabled){
            chrome.runtime.sendMessage({command: 'setRestTimer', restTime: restTime});
        }
        else {
            chrome.runtime.sendMessage({command: 'clearRestTimer'});
        }
        
    }, [isRestTimeEnabled]);

    return (
        <div>
            <h2>General</h2>
            <label>
                Allowed number of open tabs :
                <input type="number" value={maxTabs} onChange={e => setMaxTabs(e.target.value)} />
            </label>
            <label>
                Enable rest time reminder:
                <input type="checkbox" checked={isRestTimeEnabled} onChange={e => setIsRestTimeEnabled(e.target.checked)} />
            </label>
            {isRestTimeEnabled && (
                <label>
                    Reminder to take rest (in minutes) :
                    <input type="number" defaultValue={restTime} onBlur={e => setRestTime(e.target.value)} />
                </label>
            )}
            
        </div>
    );
}

export default GeneralSettings;
