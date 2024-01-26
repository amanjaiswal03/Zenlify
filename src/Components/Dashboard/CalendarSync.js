import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import SyncIcon from '@mui/icons-material/Sync';

const CalendarSync = () => {
    const [googleSync, setGoogleSync] = useState();

    // Retrieve googleSync state from chrome.storage.sync when the component mounts
    useEffect(() => {
        chrome.storage.sync.get('googleSync', function(result) {
            setGoogleSync(result.googleSync);
        });
    }, []);

    // Save googleSync state to chrome.storage.sync when it changes
    useEffect(() => {
        chrome.storage.sync.set({ googleSync });
    }, [googleSync]);

    // Start syncing with Google Calendar
    function startSync() {
        addFocusSessionToCalendar();
    }

    // Stop syncing with Google Calendar
    function stopSync() {
        removeAuthToken();
    }

    // Remove cached auth token
    function removeAuthToken() {
        chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
            if (token) {
                chrome.identity.removeCachedAuthToken({ token }, function() {
                    revokeAuthToken(token);
                });
            }
            setGoogleSync(false);
        });
    }

    // Revoke auth token
    function revokeAuthToken(token) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `https://accounts.google.com/o/oauth2/revoke?token=${token}`);
        xhr.send();
        console.log('Token revoked and removed.');
    }

    // Add focus session to Google Calendar
    function addFocusSessionToCalendar() {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
            setGoogleSync(true);
            getFocusSessionValues(token);
        });
    }

    // Get focus session values from IndexedDB
    function getFocusSessionValues(token) {
        const openRequest = indexedDB.open('focusSessionHistoryDB', 2);
        openRequest.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('focusSessionHistory')) {
              db.createObjectStore('focusSessionHistory', { keyPath: ['startDate', 'startTime'] });
            }
        };
        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['focusSessionHistory'], 'readwrite');
            const objectStore = transaction.objectStore('focusSessionHistory');
            const request = objectStore.getAll();

            request.onsuccess = function (event) {
                const focusSessionValues = event.target.result;
                focusSessionValues?.forEach(session => {
                    addEventToCalendar(session, token);
                });
            }
        }
    }

    // Add event to Google Calendar
    function addEventToCalendar(session, token) {
        const event = {
            'summary': 'Focus Session',
            'description': session.achievement,
            'start': {
                'dateTime': session.startDateTime,
                'timeZone': session.timezoneArea,
            },
            'end': {
                'dateTime': session.endDateTime,
                'timeZone': session.timezoneArea,
            }
        };
        const timeMin = encodeURIComponent(session.startDateTime);
        const timeMax = encodeURIComponent(session.endDateTime);

        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        .then(data => {
            const existingEvents = data.items;
            const isEventExist = existingEvents.some(existingEvent => existingEvent.description === event.description);

            if (isEventExist) {
                console.log('Event already exists.');
            } else {
                createEvent(event, token);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Create event in Google Calendar
    function createEvent(event, token) {
        fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).then(response => response.json())
        .then(data => {
            console.log('Event created: ' + data.htmlLink);
        })
        .catch(error => console.error('Error:', error));
    }

    return (
        <Button variant={googleSync ? "outlined" : "contained"} color={googleSync ? "secondary" : "primary"} startIcon={<SyncIcon />} onClick={googleSync ? stopSync : startSync}>
            {googleSync ? "Stop syncing to google calendar" : "Sync with google calendar"}
        </Button>
    );
};

export default CalendarSync;