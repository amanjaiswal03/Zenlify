import React, { useState, useEffect } from 'react';

const BrowsingStatistics = () => {
    const [browsingHistory, setBrowsingHistory] = useState([]);
    const [filterBy, setFilterBy] = useState('mostVisited');
    const [date, setDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);


    useEffect(() => {
        filterBrowsingHistory();
    }, [date, filterBy]);
    

    // Function to handle filter change
    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
    };

    //Function to handle date change
    const hanldeDateChange = (e) => {
        setDate(e.target.value);
    };

     // Function to filter browsing history by date
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

    return (
        <div id = "browsing-history">
            <h1>Browsing statistics </h1>
            {/* Date filter */}
            <input type="date" value={date} max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} onChange={hanldeDateChange} />
            {/* Filter by */}
            <select onChange={handleFilterChange}>
                <option value="mostVisited">Most visited</option>
                <option value="mostTimeSpent">Most time spent</option>
            </select>

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
                            <td>{entry.formattedTimeSpent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BrowsingStatistics;
