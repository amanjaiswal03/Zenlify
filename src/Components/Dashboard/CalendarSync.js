import React, {useEffect, useState} from 'react';

const CalendarSync = () => {
    const [googleSync, setGoogleSync] = useState();

    useEffect(() => {
        chrome.storage.sync.get('googleSync', function(result) {
            setGoogleSync(result.googleSync);
        });
    }, []);

    useEffect(() => {
        chrome.storage.sync.set({ googleSync: googleSync });
    }, [googleSync]);

    function startSync(){
        //set chrome storage googleSync key to true
        setGoogleSync(true);
        addFocusSessionToCalendar();
    }

    function stopSync(){
        //set chrome storage googleSync key to false
        setGoogleSync(false);
        // remove cached auth token
        chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
            if (token) {
                // remove the token from the cache
                chrome.identity.removeCachedAuthToken({ 'token': token }, function() {
                    // revoke the token
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + token);
                    xhr.send();
                    console.log('Token revoked and removed.');
                });
            }
        });
    }

    function addFocusSessionToCalendar() {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
            let focusSessionValues = [];
            const openRequest = indexedDB.open('focusSessionHistoryDB', 2);
            openRequest.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['focusSessionHistory'], 'readwrite');
                const objectStore = transaction.objectStore('focusSessionHistory');
                const request = objectStore.getAll();

                request.onsuccess = function (event) {
                    console.log(event);
                    focusSessionValues = event.target.result;
                    focusSessionValues?.forEach(session => {
                        console.log(session);
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
                            console.log(data);
                            const existingEvents = data.items;
                            console.log(existingEvents);
                            const isEventExist = existingEvents.some(existingEvent => {
                                console.log(event.start.dateTime);
                                return existingEvent.description === event.description;
                            });
        
                            if (isEventExist) {
                                console.log('Event already exists.');
                            } else {
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
                        })
                        .catch(error => console.error('Error:', error));
                    });
                }
            }
        });
    }


    return (
        <button onClick={googleSync ? stopSync : startSync}>
            {googleSync ? "Stop syncing to google calendar" : "Sync with google calendar"}
        </button>
    );
};

export default CalendarSync;