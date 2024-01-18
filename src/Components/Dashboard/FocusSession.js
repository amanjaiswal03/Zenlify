import React, { useState, useEffect } from 'react';
import CalendarSync from './CalendarSync';

const FocusSession = () => {
    const [focusSessionData, setFocusSessionData] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);


    useEffect(() => {
        // Code to run on component mount
        filterFocusSessionData(date);

    }, [date]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    }

    // Function to filter focus session data by date
    
    const filterFocusSessionData = (date) => {
        //convert date to string and in the format "January 6, 2024"
        let filteredDate = new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        console.log(filteredDate);

        const openRequest = indexedDB.open('focusSessionHistoryDB', 2);
        openRequest.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('focusSessionHistory')) {
              db.createObjectStore('focusSessionHistory', { keyPath: ['startDate', 'startTime'] });
            }
        };
        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('focusSessionHistory')) {
                console.log(`No object store: focusSessionHistory`);
                return;
            }
            const transaction = db.transaction(['focusSessionHistory'], 'readwrite');
            const objectStore = transaction.objectStore('focusSessionHistory');


            const lowerBound = [filteredDate, ''];
            const upperBound = [filteredDate, '\uffff'];
            const range = IDBKeyRange.bound(lowerBound, upperBound);
            const request = objectStore.getAll(range);
            console.log(request);

            request.onsuccess = function (event) {
                console.log(event);
                let data = event.target.result;

                console.log(data);
                if (data) {
                    setFocusSessionData(data);
                } else {
                    setFocusSessionData([]);
                }
            };
        };
        
    };

    return (
        <div id = "focus-sessions">
            <h1>Focus session history </h1>
            {/* Filter focus session data by date */}
            <CalendarSync />
            <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange}
            />
            
            <table>
                <thead>
                    <tr>
                        <th>Time-period</th>
                        <th>Total time</th>
                        <th>Achievements</th>
                    </tr>
                </thead>
                <tbody>
                    {focusSessionData?.map((session, index) => (
                        <tr key={index}>
                            <td>{`${session.startTime} - ${session.endTime}`}</td>
                            <td>{session.totalTimeElapsed}</td>
                            <td>{session.achievement}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FocusSession;
