import React from 'react';

const CalendarSync = () => {
    function addFocusSessionToCalendar() {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }

            const event = {
                'summary': 'Focus Session',
                'description': 'Focus Session',
                'start': {
                    'dateTime': '2023-10-05T09:00:00-07:00',
                    'timeZone': 'America/Los_Angeles',
                },
                'end': {
                    'dateTime': '2023-10-05T17:00:00-08:10',
                    'timeZone': 'America/Los_Angeles',
                },
            };

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
        });
    }

    return (
        <button onClick={addFocusSessionToCalendar}>Sync with google calendar</button>
    );
};

export default CalendarSync;