import React, { useState } from 'react';

function Sidepanel({ setPage }) {
    const [activePage, setActivePage] = useState('dashboard');

    const handleOptionClick = (page) => {
        setPage(page);
        setActivePage(page);
    }

    return (
        <div className="sidepanel">
            <ul>
                <li><a className={activePage === 'dashboard' ? 'active' : ''} onClick={() => handleOptionClick('dashboard')}>Dashboard</a></li>
                <li><a className={activePage === 'blocked-websites' ? 'active' : ''} onClick={() => handleOptionClick('blocked-websites')}>Blocked Websites</a></li>
                <li><a className={activePage === 'customize' ? 'active' : ''} onClick={() => handleOptionClick('customize')}>Customize</a></li>
                <li><a className={activePage === 'notifications' ? 'active' : ''} onClick={() => handleOptionClick('notifications')}>Notifications</a></li>
            </ul>
        </div>
    );
}

export default Sidepanel;

