import React, { useState, useEffect } from 'react';

const BrowsingStatistics = () => {
    const [browsingHistory, setBrowsingHistory] = useState([]);

    useEffect(() => {
        filterBrowsingHistory(new Date().toISOString().split('T')[0]);
    }, []);

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
    );
};

export default BrowsingStatistics;
