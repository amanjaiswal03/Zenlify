import React from 'react';
import PomodoroTimer from './PomodoroTimer';
import FocusSession from './FocusSession';
import BrowsingStatistics from './BrowsingStatistics';


const Dashboard = () => {
    return (
        <div>
            <PomodoroTimer />
            <FocusSession />
            <BrowsingStatistics />
        </div>
    );
};

export default Dashboard;