import React, { useState, useEffect } from 'react';

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
        date = new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        console.log(date);
        //set focus session data from chrome storage
        let key = 'focusSession-' + date;
        chrome.storage.sync.get(key, (result) => {
            const filteredData = result[key]?.filter(session => session.startDate === date);
            // Update the focus session data state with the filtered data
            setFocusSessionData(filteredData);
        });
    };

    return (
        <div id = "focus-sessions">
            <h1>Focus session history </h1>
            {/* Filter focus session data by date */}
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
