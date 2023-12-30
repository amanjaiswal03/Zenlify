// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './Components/Dashboard';
import Sidepanel from './Components/Sidepanel';
import BlockedWebsites from './Components/BlockedWebsites';

function App() {
  return (
    <div className="App">
      <Router>
        <Sidepanel />
        <Routes>
          <Route path="/blocked-websites" element={<BlockedWebsites />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

