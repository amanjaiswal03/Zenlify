import React, { useState } from "react";
import { Drawer, List, MenuItem, ListItemText, Typography, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import BlockIcon from "@mui/icons-material/Block";
import NotificationsIcon from "@mui/icons-material/Notifications";

function Sidepanel({ setPage }) {
  const [activePage, setActivePage] = useState("dashboard");

  const handleOptionClick = (page) => {
    setPage(page);
    setActivePage(page);
  };

  return (
    <Drawer variant="permanent" open={true}>
      <Box sx={{ padding: 2 }}>
        <img src="../../images/zenlify_logo.png" alt="logo" style={{ width: "100px", height: "100px" }} />
        <Typography variant="h6">Zenlify</Typography>
      </Box>
      <List>
        <MenuItem 
          sx={{ backgroundColor: activePage === "dashboard" ? "#f0f0f0" : "transparent", padding: 2 }} 
          onClick={() => handleOptionClick("dashboard")}>
          <DashboardIcon />
          <ListItemText primary="Dashboard" />
        </MenuItem>
        <MenuItem 
          sx={{ backgroundColor: activePage === "blocked-websites" ? "#f0f0f0" : "transparent", padding: 2 }} 
          onClick={() => handleOptionClick("blocked-websites")}>
          <BlockIcon />
          <ListItemText primary="Blocked Websites" />
        </MenuItem>
        <MenuItem 
          sx={{ backgroundColor: activePage === "customize" ? "#f0f0f0" : "transparent", padding: 2 }} 
          onClick={() => handleOptionClick("customize")}>
          <SettingsIcon />
          <ListItemText primary="Customize" />
        </MenuItem>
        <MenuItem 
          sx={{ backgroundColor: activePage === "notifications" ? "#f0f0f0" : "transparent", padding: 2}} 
          onClick={() => handleOptionClick("notifications")}>
          <NotificationsIcon />
          <ListItemText primary="Notifications" />
        </MenuItem>
      </List>
    </Drawer>
  );
}

export default Sidepanel;