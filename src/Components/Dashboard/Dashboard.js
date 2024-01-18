import React from 'react';
import PomodoroTimer from './PomodoroTimer';
import FocusSession from './FocusSession';
import BrowsingStatistics from './BrowsingStatistics';


const Dashboard = () => {
    return (
        <div>
        <div style={{ display: 'flex' }}>
            <FocusSession />
            <PomodoroTimer />
        </div>
        <BrowsingStatistics />
        </div>
    );
};

export default Dashboard;