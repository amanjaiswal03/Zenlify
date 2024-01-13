import React, {useState} from 'react';

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
                focusSessionValues.forEach(sessions => {
                    sessions.forEach(session => {
                        console.log(session.startDate);
    
                        // convert session.startDate from "January 6, 2024" to "2024-01-06"
                        const startDate = new Date(session.startDate).toISOString().split('T')[0];
                        const startTime = session.startTime.split(' ')[0] + ':00+01:00';
                        const endTime = session.endTime.split(' ')[0] + ':00+01:00';


                        const startDateTime = `${startDate}T${startTime}`;
                        const endDateTime = `${startDate}T${endTime}`;
                        
                        const event = {
                            'summary': 'Focus Session',
                            'description': session.achievement,
                            'start': {
                                'dateTime': startDateTime,
                                'timeZone': 'America/Los_Angeles',
                            },
                            'end': {
                                'dateTime': endDateTime,
                                'timeZone': 'America/Los_Angeles',
                            }
                        };
                        const timeMin = encodeURIComponent(event.start.dateTime);
                        const timeMax = encodeURIComponent(event.end.dateTime);

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