import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Paper } from '@mui/material';
import { Box } from '@mui/system';

function PomodoroTimer() {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerDisplay, setTimerDisplay] = useState('25:00');
    const [pomodoroDuration, setPomodoroDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [title, setTitle] = useState('Focus Session');


    useEffect(() => {
        // Check if the timer is running when the component is mounted
        chrome.runtime.sendMessage({ command: 'isRunning' }, (response) => {
            console.log(response);
            setIsTimerRunning(response);
        });

        // Event listener for timer updates
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.minutes !== null && msg.seconds !== null) {
                setTimerDisplay(`${msg.minutes < 10 ? '0' : ''}${msg.minutes}:${msg.seconds < 10 ? '0' : ''}${msg.seconds}`);
            }
        });

        //check if the timer is on break session
        chrome.storage.sync.get(['breakTime'], ({ breakTime }) => {
            if (breakTime) {
                setTitle('Break Session');
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
        setTitle('Focus Session');
    };

    return (
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 3 }}>
            <Paper elevation={3} sx={{ p: 2, width: '100%', maxWidth: 400 }}>
                <Typography variant="h4" component="div" gutterBottom align="left">
                    {title}
                </Typography>
                <Typography variant="h2" component="div" align="center" gutterBottom>
                    {timerDisplay}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <TextField
                        id="pomodoroDuration"
                        type="number"
                        defaultValue={pomodoroDuration}
                        onBlur={(e) => setPomodoroDuration(parseInt(e.target.value))}
                        label="Pomodoro Duration (minutes)"
                    />
                    <TextField
                        id="breakDuration"
                        type="number"
                        defaultValue={breakDuration}
                        onBlur={(e) => setBreakDuration(parseInt(e.target.value))}
                        label="Break Duration (minutes)"
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button variant="contained" color="primary" onClick={handleStartButtonClick}>
                        {isTimerRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleResetButtonClick}>
                        Reset
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default PomodoroTimer;