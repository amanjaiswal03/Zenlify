import React, { useState, useEffect } from 'react';

function PomodoroTimer() {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerDisplay, setTimerDisplay] = useState('25:00');
    const [pomodoroDuration, setPomodoroDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);

    useEffect(() => {
        // Check if the timer is running when the component is mounted
        chrome.runtime.sendMessage({ command: 'isRunning' }, (response) => {
            console.log(response);
            setIsTimerRunning(response);
        });

        // Event listener for timer updates
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.minutes !== null && msg.seconds !== null) {
                setTimerDisplay(`${msg.minutes}:${msg.seconds < 10 ? '0' : ''}${msg.seconds}`);
            }
            else{
                setTimerDisplay('25:00');
            }
        });

        // Request timer update every second
        const interval = setInterval(() => {
            chrome.runtime.sendMessage({ command: 'getTimer' });
        }, 1000);


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
                defaultValue={pomodoroDuration}
                onBlur={(e) => setPomodoroDuration(parseInt(e.target.value))}
            />
            <input
                id="breakDuration"
                type="number"
                defaultValue={breakDuration}
                onBlur={(e) => setBreakDuration(parseInt(e.target.value))}
            />
        </div>
    );
}

export default PomodoroTimer;
