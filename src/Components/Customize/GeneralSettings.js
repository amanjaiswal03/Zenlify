import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';

function GeneralSettings() {
    const [maxTabs, setMaxTabs] = useState(); // Default to 10 tabs

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['maxTabs'], ({ maxTabs }) => {
            setMaxTabs(maxTabs);
        });
    }, []);

    useEffect(() => {
         chrome.storage.sync.set({ maxTabs: maxTabs });
    }, [maxTabs]);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" component="div" gutterBottom>
                General
            </Typography>
            <TextField
                type="number"
                label="Allowed number of open tabs"
                value={maxTabs}
                onChange={e => setMaxTabs(e.target.value)}
                variant="outlined"
            />
        </Box>
    );
}

export default GeneralSettings;
