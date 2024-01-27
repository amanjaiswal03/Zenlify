import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Avatar, Card, Typography, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Component to display a single blocked website
const BlockedWebsiteItem = ({ website, onRemove, isFocus }) => (
    <ListItem key={website}>
        <Card sx={{ width: '100%', marginTop: 2, display: 'flex', alignItems: 'center'}}>
            <Avatar src={`https://www.google.com/s2/favicons?domain=${website}&sz=64`} sx={{ margin: 2 }} />
            <ListItemText primary={website} />
            <Chip label={isFocus ? "Focus Blocked" : "Blocked"} color={isFocus ? "secondary" : "primary"} sx={{ marginRight: 8 }} />
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
    const [blockedWebsitesFocus, setBlockedWebsitesFocus] = useState([]);
    const [websiteInput, setWebsiteInput] = useState('');

    // Retrieve blocked websites from chrome.storage.sync when the component mounts
    useEffect(() => {
        chrome.storage.sync.get(['blockedWebsites', 'blockedWebsitesFocus'], (result) => {
            if (result.blockedWebsites) {
                setBlockedWebsites(result.blockedWebsites);
            }
            if (result.blockedWebsitesFocus) {
                setBlockedWebsitesFocus(result.blockedWebsitesFocus);
            }
        });
    }, []);

    const addWebsite = (websiteList, setWebsiteList, storageKey) => {
        let websiteToAdd = websiteInput;
        if (!websiteInput.startsWith('www.') && !websiteInput.match(/^[^.]+\.[^.]+\.[^.]+$/)) {
            websiteToAdd = 'www.' + websiteInput;
        }
        if (!websiteList.includes(websiteToAdd)) {
            const updatedWebsiteList = [...websiteList, websiteToAdd];
            setWebsiteList(updatedWebsiteList);
            chrome.storage.sync.set({ [storageKey]: updatedWebsiteList });
        }
        setWebsiteInput('');
    };

    // Add a new website to the blocked list
    const handleAddToBlockedWebsites = () => {
        addWebsite(blockedWebsites, setBlockedWebsites, 'blockedWebsites');
    };

    // Add a new website to the blocked website focus list
    const handleAddToBlockedWebsitesFocus = () => {
        addWebsite(blockedWebsitesFocus, setBlockedWebsitesFocus, 'blockedWebsitesFocus');
    };

    // Remove a website from the blocked list
    const handleRemoveFromList = (websiteToRemove, websiteList, setWebsiteList, storageKey) => {
        const updatedWebsiteList = websiteList.filter((website) => website !== websiteToRemove);
        setWebsiteList(updatedWebsiteList);
        chrome.storage.sync.set({ [storageKey]: updatedWebsiteList });
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
                    <Tooltip
                    title= "Add websites to the blocked list to prevent access to them. These websites will be blocked regardless of the focus session."
                    classes={{ tooltip: 'custom-tooltip' }}
                    >
                        Add to Blocked List
                    </Tooltip>
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleAddToBlockedWebsitesFocus} 
                    sx={{ marginTop: 2, marginLeft: 2 }}
                >
                    <Tooltip
                        title="Add websites to the focus blocked list to prevent access to them only when the focus session is ongoing. These websites will not be blocked outside of the focus session."
                        classes={{ tooltip: 'custom-tooltip' }}
                    >
                        Add to Focus Blocked List
                    </Tooltip>
                </Button>
                <List>
                    {blockedWebsites.map((website) => (
                        <BlockedWebsiteItem 
                            key={website} 
                            website={website} 
                            onRemove={() => handleRemoveFromList(website, blockedWebsites, setBlockedWebsites, 'blockedWebsites')} 
                            isFocus={false} 
                        />
                    ))}
                    {blockedWebsitesFocus.map((website) => (
                        <BlockedWebsiteItem 
                            key={website} 
                            website={website} 
                            onRemove={() => handleRemoveFromList(website, blockedWebsitesFocus, setBlockedWebsitesFocus, 'blockedWebsitesFocus')} 
                            isFocus={true} 
                        />
                    ))}
                </List>
            </Box>
        </div>
    );
};

export default BlockedWebsites;
