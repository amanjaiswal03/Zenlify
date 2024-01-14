import React, {useState} from 'react';


const moment = require('moment-timezone');
const CalendarSync = () => {

    function addFocusSessionToCalendar() {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
            chrome.storage.sync.get(null, function(items) {
                const focusSessionKeys = Object.keys(items).filter(key => key.startsWith('focusSession-'));
                const focusSessionValues = focusSessionKeys.map(key => items[key]);
                console.log(focusSessionValues);
                focusSessionValues?.forEach(sessions => {
                    sessions?.forEach(session => {
                        //convert session.startDateTime from "2024-01-14T11:21:44.544Z" to "2024-01-14T11:21:44+08:00"
                        console.log(session.endDateTime);
                        console.log(session.startDateTime);
                        const startDateTime = moment(session.startDateTime).tz(session.timezone).format();
                        const endDateTime = moment(session.endDateTime).tz(session.timezone).format();
                        console.log(endDateTime);
                        const event = {
                            'summary': 'Focus Session',
                            'description': session.achievement,
                            'start': {
                                'dateTime': startDateTime,
                                'timeZone': session.timezone,
                            },
                            'end': {
                                'dateTime': endDateTime,
                                'timeZone': session.timezone,
                            }
                        };
                        const timeMin = encodeURIComponent(startDateTime);
                        const timeMax = encodeURIComponent(endDateTime);

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
                });
            });
            //set chrome storage googleSync key to true
            chrome.storage.sync.set({ googleSync: true });
        });
    }


    return (
        <button onClick={addFocusSessionToCalendar}>Sync with google calendar</button>
    );
};

export default CalendarSync;