import React, { useState } from "react";
import "./App.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import Sidepanel from "./Components/Sidepanel/Sidepanel";
import BlockedWebsites from "./Components/BlockedWebsites/BlockedWebsites";
import Customize from "./Components/Customize/Customize";
import Notifications from "./Components/Notifications/Notifications";

function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch(page) {
    case "blocked-websites":
      return <BlockedWebsites />;
    case "customize":
      return <Customize />;
    case "notifications":
      return <Notifications />;
    default:
      return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Sidepanel setPage={setPage} />
      {renderPage()}
    </div>
  );
}

export default App;

