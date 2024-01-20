import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';

function GeneralSettings() {
    const [maxTabs, setMaxTabs] = useState(); 

    useEffect(() => {
        // Retrieve maxTabs from chrome.storage.sync when the component mounts
        chrome.storage.sync.get(['maxTabs'], ({ maxTabs }) => {
            setMaxTabs(maxTabs);
        });
    }, []);

    // Save maxTabs to chrome.storage.sync when it changes
    useEffect(() => {
         chrome.storage.sync.set({ maxTabs: maxTabs });
    }, [maxTabs]);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="div" gutterBottom>
                Tabs
            </Typography>
            <TextField
                type="number"
                label="Allowed number of open tabs"
                value={maxTabs}
                onBlur={e => setMaxTabs(e.target.value)}
                variant="outlined"
            />
        </Box>
    );
}

export default GeneralSettings;
