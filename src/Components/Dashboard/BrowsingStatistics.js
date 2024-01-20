import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, Button, Avatar } from '@mui/material';
import Paper from '@mui/material/Paper';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const BrowsingStatistics = () => {
    const [browsingHistory, setBrowsingHistory] = useState([]);
    const [filterBy, setFilterBy] = useState('mostVisited');
    const [date, setDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
    const [isExpanded, setIsExpanded] = useState(false);
    const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6'];

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
    // prepare data for bar chart
    const barData = browsingHistory.slice(0, 5).map(entry => ({
        name: entry.website,
        timesVisited: entry.timesVisited,
        timeSpent: entry.timeSpent,
        formattedTimeSpent: entry.formattedTimeSpent,
    }));


    return (
        <div style={{ display: 'flex', marginLeft: "-80px"}}>
        <Container>
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
                                    <TableCell><strong>Website</strong></TableCell>
                                    <TableCell><strong>Times visited</strong></TableCell>
                                    <TableCell><strong>Time spent</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(isExpanded ? browsingHistory : browsingHistory.slice(0, 5)).map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={`https://www.google.com/s2/favicons?domain=${entry.website}&sz=64`} sx={{ margin: 2 }} />
                                                <span>{entry.website}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{entry.timesVisited}</TableCell>
                                        <TableCell>{entry.formattedTimeSpent}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {browsingHistory.length > 5 && (
                    <Button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                    )}
                </div>
                
                <BarChartView barData={barData} colors={colors}/>
                
            </div>
        </Container>
        </div>
    );
};

const BarChartView = (props) => {
    return (
        <div style={{ display: 'flex' }}>
            <div style = {{marginLeft: "50px"}}>
                <BarChart width={500} height={300} data={props.barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedTimeSpent" label={{ value: 'Time spent', position: 'insideBottomRight', offset: 0 }} />
                    <YAxis label={{ value: 'Times visited', angle: -90, position: 'insideLeft' }}/>
                    <Tooltip formatter={(value, name, props) => [`${props.payload.name},  visited:${props.payload.timesVisited} `]} />
                    <Bar dataKey="timesVisited">
                        {
                            props.barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={props.colors[index % props.colors.length]} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </div>
            <div>
                {props.barData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: props.colors[index], marginRight: '10px' }}></div>
                        <p>{entry.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}


export default BrowsingStatistics;

