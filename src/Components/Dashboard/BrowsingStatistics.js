import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem } from '@mui/material';
import Paper from '@mui/material/Paper';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const BrowsingStatistics = () => {
    const [browsingHistory, setBrowsingHistory] = useState([]);
    const [filterBy, setFilterBy] = useState('mostVisited');
    const [date, setDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);

    useEffect(() => {
        filterBrowsingHistory();
    }, [date, filterBy]);

    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const filterBrowsingHistory = () => {
        let filteredDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        console.log(filteredDate);

        // Get browsing history from IndexedDB
        const openRequest = indexedDB.open("browsingHistoryDB", 1);
        openRequest.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('browsingHistory')) {
              db.createObjectStore('browsingHistory', { keyPath: ['formattedDate', 'website'] });
            }
        };
        openRequest.onsuccess = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('browsingHistory')) {
                console.log(`No object store: browsingHistory`);
                return;
            }
            const transaction = db.transaction(['browsingHistory'], "readwrite");
            const objectStore = transaction.objectStore('browsingHistory');

            const lowerBound = [filteredDate, ''];
            const upperBound = [filteredDate, '\uffff'];
            const range = IDBKeyRange.bound(lowerBound, upperBound);
            const request = objectStore.getAll(range);

            request.onsuccess = function(event) {
                console.log(event);
                let data = event.target.result;

                console.log(data);
                if (data) {
                    // Sort the data
                    if (filterBy === 'mostVisited') {
                        data.sort((a, b) => b.timesVisited - a.timesVisited);
                    } else if (filterBy === 'mostTimeSpent') {
                        data.sort((a, b) => b.timeSpent - a.timeSpent);
                    }
                    setBrowsingHistory(data);
                } else {
                    setBrowsingHistory([]);
                }
            };
        }
    };
    // Prepare data for the pie chart
    const pieData = browsingHistory.map(entry => ({
        name: entry.website,
        value: entry.timeSpent, // Use timeSpent for the value
        timesVisited: entry.timesVisited, // Add timesVisited to the data
        formattedTimeSpent: entry.formattedTimeSpent, // Add formattedTimeSpent to the data
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Generate random color
    }));


    return (
        <div style={{ display: 'flex', marginLeft: "-370px"}}>
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom align="left">
                Browsing statistics
            </Typography>
            <div style={{ display: 'flex' }}>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Select
                            value={filterBy}
                            onChange={handleFilterChange}
                            variant="outlined"
                        >
                            <MenuItem value="mostVisited">Most visited</MenuItem>
                            <MenuItem value="mostTimeSpent">Most time spent</MenuItem>
                        </Select>
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
                                    <TableCell>Website</TableCell>
                                    <TableCell>Times visited</TableCell>
                                    <TableCell>Time spent</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {browsingHistory?.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{entry.website}</TableCell>
                                        <TableCell>{entry.timesVisited}</TableCell>
                                        <TableCell>{entry.formattedTimeSpent}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <PieChart width={500} height={500}> {/* Increase size */}
                    <Pie
                        data={pieData}
                        cx={250} // Adjust center
                        cy={250} // Adjust center
                        labelLine={false}
                        outerRadius={100} // Increase radius
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {
                            pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)
                        }
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${name}, Time spent: ${props.payload.formattedTimeSpent}, visited ${props.payload.timesVisited} times`]} />
                </PieChart>
                <div>
                    {pieData.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '10px' }}></div>
                            <p style={{ fontSize: '10px' }}>{entry.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
        </div>
    );
};

export default BrowsingStatistics;

