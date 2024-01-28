import React, { useState, useEffect } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";

function ContentSettings() {
  const [isHideWidgets, setIsHideWidgets] = useState(false);
  const [blockAds, setblockAds] = useState(false);

  useEffect(() => {
    // Code to run on component mount
    chrome.storage.sync.get(["isHideWidgets", "blockAds"], ({ isHideWidgets, blockAds }) => {
      setIsHideWidgets(isHideWidgets);
      setblockAds(blockAds);
    });
  }, []);

  useEffect(() => {
    // Code to run when isHideWidgets changes
    chrome.storage.sync.set({ isHideWidgets: isHideWidgets, blockAds: blockAds });
  }, [isHideWidgets, blockAds]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" component="div" gutterBottom>
                Content
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={isHideWidgets}
            onChange={() => setIsHideWidgets(!isHideWidgets)}
            name="isHideWidgets"
            color="primary"
          />
        }
        label="Distraction free youtube (hide 'suggestions' and ads)"
      /> <br />
      <FormControlLabel
        control={
          <Switch
            checked={blockAds}
            onChange={() => setblockAds(!blockAds)}
            name="blockAds"
            color="primary"
          />
        }
        label="Block common ads from websites"
      />
    </Box>
  );
}

export default ContentSettings;