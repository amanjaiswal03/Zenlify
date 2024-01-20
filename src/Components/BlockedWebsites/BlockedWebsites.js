import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Avatar, Card, Typography, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Component to display a single blocked website
const BlockedWebsiteItem = ({ website, onRemove }) => (
    <ListItem key={website}>
        <Card sx={{ width: '100%', marginTop: 2, display: 'flex', alignItems: 'center'}}>
            <Avatar src={`https://www.google.com/s2/favicons?domain=${website}&sz=64`} sx={{ margin: 2 }} />
            <ListItemText primary={website} />
            <Chip label="Blocked" color="secondary" sx={{ marginRight: 8 }} />
            <ListItemSecondaryAction sx={{padding: 2, marginTop: 1}}>
                <IconButton edge="end" aria-label="delete" onClick={() => onRemove(website)}>
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </Card>
    </ListItem>
);

const BlockedWebsites = () => {
    const [blockedWebsites, setBlockedWebsites] = useState([]);
    const [websiteInput, setWebsiteInput] = useState('');

    // Retrieve blocked websites from chrome.storage.sync when the component mounts
    useEffect(() => {
        chrome.storage.sync.get('blockedWebsites', (result) => {
            if (result.blockedWebsites) {
                setBlockedWebsites(result.blockedWebsites);
            }
        });
    }, []);

    // Add a new website to the blocked list
    const handleAddToBlockedWebsites = () => {
        let websiteToAdd = websiteInput;
        if (!websiteInput.startsWith('www.') && !websiteInput.match(/^[^.]+\.[^.]+\.[^.]+$/)) {
            websiteToAdd = 'www.' + websiteInput;
        }
        if (!blockedWebsites.includes(websiteToAdd)) {
            const updatedBlockedWebsites = [...blockedWebsites, websiteToAdd];
            setBlockedWebsites(updatedBlockedWebsites);
            chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });
        }
        setWebsiteInput('');
    };

    // Remove a website from the blocked list
    const handleRemoveFromBlockedWebsites = (websiteToRemove) => {
        const updatedBlockedWebsites = blockedWebsites.filter((website) => website !== websiteToRemove);
        setBlockedWebsites(updatedBlockedWebsites);
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
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
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
                        <BlockedWebsiteItem website={website} onRemove={handleRemoveFromBlockedWebsites} />
                    ))}
                </List>
            </Box>
        </div>
    );
};

export default BlockedWebsites;