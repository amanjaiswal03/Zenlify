import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Avatar, Card, Typography, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
        if (!searchTerm.startsWith('www.') && !searchTerm.match(/^[^.]+\.[^.]+\.[^.]+$/)) {
            updatedWebsite = 'www.' + searchTerm;
        }
        if (!blockedWebsites.includes(updatedWebsite)) {
            const updatedBlockedWebsites = [...blockedWebsites, updatedWebsite];
            setBlockedWebsites(updatedBlockedWebsites);

            // Save updated blockedWebsites array to chrome.storage.sync
            chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });
        }
        setSearchTerm('');
    };

    const handleRemoveFromBlockedWebsites = (website) => {
        // Remove website from blockedWebsites array
        const updatedBlockedWebsites = blockedWebsites.filter((item) => item !== website);
        setBlockedWebsites(updatedBlockedWebsites);

        // Save updated blockedWebsites array to chrome.storage.sync
        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
            <Box sx={{ padding: 2, width: '100%', maxWidth: 600 }}>
                <Typography variant="h4" component="div" gutterBottom>
                    Blocked Websites
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter website URL"
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleAddToBlockedWebsites} 
                    sx={{ marginTop: 2 }}>
                    Add to Blocked List
                </Button>

                <List>
                    {blockedWebsites.map((website) => (
                        <ListItem key={website}>
                            <Card sx={{ width: '100%', marginTop: 2, display: 'flex', alignItems: 'center'}}>
                                <Avatar src={`https://www.google.com/s2/favicons?domain=${website}&sz=64`} sx={{ margin: 2 }} />
                                <ListItemText primary={website} />
                                <Chip label="Blocked" color="secondary" sx={{ marginRight: 8 }} />
                                <ListItemSecondaryAction sx={{padding: 2, marginTop: 1}}>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFromBlockedWebsites(website)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </div>
    );
};

export default BlockedWebsites;