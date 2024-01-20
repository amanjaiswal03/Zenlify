import React, { useState, useEffect } from 'react';
import CalendarSync from './CalendarSync';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Button } from '@mui/material';
import Paper from '@mui/material/Paper';

const FocusSession = () => {
    const [focusSessionData, setFocusSessionData] = useState([]);
    const [date, setDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        filterFocusSessionData(date);
    }, [date]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    }

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

                if (data) {
                    // Sort the data ased on startDateTime
                    data.sort((a, b) => {
                        return new Date(b.startDateTime) - new Date(a.startDateTime);
                    });
                    console.log(data);
                    setFocusSessionData(data);
                } else {
                    setFocusSessionData([]);
                }
            };
        };
    };

    return (
        <Container maxWidth="md">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h4" component="h1" gutterBottom align="left">
                    Focus session logs
                </Typography>
                <div>
                <CalendarSync />
                </div>
            </div>
            
            <div style = {{display: 'flex', justifyContent: 'flex-end'}}>
                <TextField
                    type="date"
                    value={date}
                    max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Time-period</strong></TableCell>
                            <TableCell><strong>Total time</strong></TableCell>
                            <TableCell><strong>Achievements</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(isExpanded ? focusSessionData : focusSessionData.slice(0, 5)).map((session, index) => (
                            <TableRow key={index}>
                                <TableCell>{`${session.startTime} - ${session.endTime}`}</TableCell>
                                <TableCell>{session.totalTimeElapsed}</TableCell>
                                <TableCell>{session.achievement}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {focusSessionData.length > 5 && (
                <Button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                </Button>
            )}
        </Container>
    );
};

export default FocusSession;
