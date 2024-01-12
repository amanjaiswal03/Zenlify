import React, { useState, useEffect } from 'react';

const Notifications = () => {
    const [pomodoroNotificationMessage, setPomodoroNotificationMessage] = useState('');
    const [breakNotificationMessage, setBreakNotificationMessage] = useState('');

    useEffect(() => {
        chrome.storage.sync.get(['pomodoroNotificationMessage', 'breakNotificationMessage'], (result) => {
            setPomodoroNotificationMessage(result.pomodoroNotificationMessage);
            setBreakNotificationMessage(result.breakNotificationMessage);
        });
    }, []);
    
    useEffect(() => {
        chrome.storage.sync.set({ pomodoroNotificationMessage: pomodoroNotificationMessage });
    }, [pomodoroNotificationMessage]);

    useEffect(() => {
        chrome.storage.sync.set({ breakNotificationMessage: breakNotificationMessage });
    }, [breakNotificationMessage]);

    return (
        <div>
            <h1>Notifications</h1>
            <label>Pomodoro Notification Message</label>
            <textarea
                defaultValue={pomodoroNotificationMessage}
                onBlur={(e) => setPomodoroNotificationMessage(e.target.value)}
            />
            <br />
            <label>Break Notification Message</label>
            <textarea
                defaultValue={breakNotificationMessage}
                onBlur={(e) => setBreakNotificationMessage(e.target.value)}
            />
        </div>
    );
};

export default Notifications;
