import React, { useState, useEffect } from 'react';

const BlockedWebsites = () => {
    const [blockedWebsites, setBlockedWebsites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Retrieve blocked websites from chrome.storage.sync
        chrome.storage.sync.get('blockedWebsites', (result) => {
            if (result.blockedWebsites) {
                setBlockedWebsites(result.blockedWebsites);
            }
        });
    }, []);

    const handleAddToBlockedWebsites = () => {
        // Add website to blockedWebsites array if it is not already present
        let updatedWebsite = searchTerm;
        if (!searchTerm.startsWith('www.')) {
            updatedWebsite = 'www.' + searchTerm;
        }
        if (!blockedWebsites.includes(updatedWebsite)) {
            const updatedBlockedWebsites = [...blockedWebsites, updatedWebsite];
            setBlockedWebsites(updatedBlockedWebsites);

            // Save updated blockedWebsites array to chrome.storage.sync
            chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });
        }
    };

    const handleRemoveFromBlockedWebsites = (website) => {
        // Remove website from blockedWebsites array
        const updatedBlockedWebsites = blockedWebsites.filter((item) => item !== website);
        setBlockedWebsites(updatedBlockedWebsites);

        // Save updated blockedWebsites array to chrome.storage.sync
        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter website URL"
            />
            <button onClick={handleAddToBlockedWebsites}>Add to Blocked List</button>

            <ul>
                {blockedWebsites.map((website) => (
                    <li key={website}>
                        {website}
                        <button onClick={() => handleRemoveFromBlockedWebsites(website)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlockedWebsites;
