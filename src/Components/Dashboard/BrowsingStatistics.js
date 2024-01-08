import React, { useState, useEffect } from 'react';

const BrowsingStatistics = () => {
    const [browsingHistory, setBrowsingHistory] = useState([]);
    const [filterBy, setFilterBy] = useState('mostVisited');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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

        console.log(date);
        let filteredDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        console.log(filteredDate);

        chrome.storage.sync.get('browsingHistory', (result) => {
            console.log(result);
            const filteredHistory = result.browsingHistory?.filter((entry) => entry.date === filteredDate);
            console.log(filteredHistory);
            if (filterBy === 'mostVisited') {
                filteredHistory.sort((a, b) => b.timesVisited - a.timesVisited);
            } else if (filterBy === 'mostTimeSpent') {
                filteredHistory.sort((a, b) => b.timeSpent - a.timeSpent);
            }
            setBrowsingHistory(filteredHistory); // Reverse the array to get descending order
        });
    };

    return (
        <div id = "browsing-history">
            <h1>Browsing statistics </h1>
            {/* Date filter */}
            <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={hanldeDateChange} />
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
                            <td>{entry.formattedtimeSpent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BrowsingStatistics;
