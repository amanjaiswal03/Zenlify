import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Chip, Typography } from '@mui/material';

const FilterKeywords = () => {
    const [keywords, setKeywords] = useState('');
    const [tagKeywords, setTagKeywords] = useState([]);

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['blockedKeywords'], ({ blockedKeywords }) => {
            setTagKeywords(blockedKeywords);
        });
    }, []);

    useEffect(() => {
        // Code to run when isHideWidgets changes
        chrome.storage.sync.set({ blockedKeywords: tagKeywords});
    }, [tagKeywords]);

    const saveKeywords = () => {
        const keywordArray = keywords.split(',');
        setTagKeywords([...tagKeywords, ...keywordArray]);
        setKeywords('');
    };

    const removeKeyword = (keyword) => {
        const updatedKeywords = tagKeywords.filter((kw) => kw !== keyword);
        setTagKeywords(updatedKeywords);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
        <Box sx={{ padding: 2, maxWidth: 'sm' }}>
            <Typography component="div" gutterBottom>
                Enter keyword(s) you want to hide from all websites
            </Typography>
            <TextField
                type="text"
                label="Enter keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                variant="outlined"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={saveKeywords} sx={{ marginTop: 2 }}>
                Save
            </Button>

            <Box sx={{ marginTop: 2 }}>
                {tagKeywords.map((keyword) => (
                    <Chip
                        key={keyword}
                        label={keyword}
                        onDelete={() => removeKeyword(keyword)}
                        color="primary"
                        variant="outlined"
                        sx={{ margin: 1 }}
                    />
                ))}
            </Box>
        </Box>
        </div>
    );
};

export default FilterKeywords;