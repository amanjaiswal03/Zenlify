import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerDisplay, setTimerDisplay] = useState('25:00');
    const [pomodoroDuration, setPomodoroDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [focusSessionData, setFocusSessionData] = useState([]);
    const [browsingHistory, setBrowsingHistory] = useState([]);

    useEffect(() => {
        // Check if the timer is running when the component is mounted
        chrome.runtime.sendMessage({ command: 'isRunning' }, (response) => {
            console.log(response);
            setIsTimerRunning(response);
        });

        // Event listener for timer updates
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.minutes !== undefined && msg.seconds !== undefined) {
                setTimerDisplay(`${msg.minutes}:${msg.seconds < 10 ? '0' : ''}${msg.seconds}`);
            }
        });

        // Request timer update every second
        const interval = setInterval(() => {
            chrome.runtime.sendMessage({ command: 'getTimer' });
        }, 1000);

        filterFocusSessionData(new Date().toISOString().split('T')[0]);


        // Fetch browsing history on component mount
        filterBrowsingHistory(new Date().toISOString().split('T')[0]);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);

        
    }, []);




    const handleStartButtonClick = () => {
        if (isTimerRunning) {
            // Pause the timer
            chrome.runtime.sendMessage({ command: 'pause' });
        } else {
            // Start the timer
            chrome.runtime.sendMessage({ command: 'start', pomodoroDuration, breakDuration });
        }
        setIsTimerRunning(!isTimerRunning);
    };

    const handleResetButtonClick = () => {
        chrome.runtime.sendMessage({ command: 'reset' });
        setIsTimerRunning(false);
    };

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
            chrome.storage.sync.get('focusSessionData', (result) => {
                const filteredData = result.focusSessionData?.filter(session => session.startDate === date);
                // Update the focus session data state with the filtered data
                setFocusSessionData(filteredData);
            });
    };

    // Function to filter browsing history by date
    const filterBrowsingHistory = (date) => {
        //convert date to string and in the format "January 6, 2024"
        date = new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        chrome.storage.sync.get('browsingHistory', (result) => {
            console.log(result);
            const filteredHistory = result.browsingHistory?.filter((entry) => entry.date === date);
            console.log(filteredHistory);
            setBrowsingHistory(filteredHistory);
        });
    };

    return (
        <div>
            <button id="start" onClick={handleStartButtonClick}>
                {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button id="reset" onClick={handleResetButtonClick}>
                Reset
            </button>
            <div id="time">{timerDisplay}</div>
            <input
                id="pomodoroDuration"
                type="number"
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(parseInt(e.target.value))}
            />
            <input
                id="breakDuration"
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
            />

            {/* Display focus session data */}

            <div id = "focus-sessions">
                <h1>Focus session history </h1>
                {/* Filter focus session data by date */}
                <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => filterFocusSessionData(e.target.value)}
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
            <div id = "browsing-history">
            <h1>Browsing statistics </h1>
            {/* Date filter */}
            <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => filterBrowsingHistory(e.target.value)}
            />

            {/* Browsing history table */}
            <table>
                <thead>
                    <tr>
                        <th>Website</th>
                        <th>Times visited</th>
                        <th>Time spent</th>
                    </tr>
                </thead>
                <tbody>
                    {browsingHistory?.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.website}</td>
                            <td>{entry.timesVisited}</td>
                            <td>{entry.formattedtimeSpent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

            
        </div>
    );
};

export default Dashboard;