import React, { useState, useEffect } from "react";
import { Box, TextField, Typography } from "@mui/material";

const Notifications = () => {
  const [pomodoroNotificationMessage, setPomodoroNotificationMessage] = useState("");
  const [breakNotificationMessage, setBreakNotificationMessage] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["pomodoroNotificationMessage", "breakNotificationMessage"], (result) => {
      setPomodoroNotificationMessage(result.pomodoroNotificationMessage);
      setBreakNotificationMessage(result.breakNotificationMessage);
    });
  }, []);
    
  useEffect(() => {
    chrome.storage.sync.set({ pomodoroNotificationMessage: pomodoroNotificationMessage });
  }, [pomodoroNotificationMessage]);

  useEffect(() => {
    chrome.storage.sync.set({ breakNotificationMessage: breakNotificationMessage });
  }, [breakNotificationMessage]);

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100vh" }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" component="div" gutterBottom>
                    Notifications
        </Typography>
        <Typography variant="h6" component="div" gutterBottom>
                    Customize messages
        </Typography>
                
        <TextField
          label="Pomodoro Notification Message"
          multiline
          rows={4}
          defaultValue={pomodoroNotificationMessage}
          onBlur={(e) => setPomodoroNotificationMessage(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Break Notification Message"
          multiline
          rows={4}
          defaultValue={breakNotificationMessage}
          onBlur={(e) => setBreakNotificationMessage(e.target.value)}
          variant="outlined"
          fullWidth
        />
      </Box>
    </div>
  );
};

export default Notifications;
