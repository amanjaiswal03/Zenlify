import React, { useState, useEffect } from 'react';
import GeneralSettings from './GeneralSettings';

function Customize() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Customize your web experience</h1>
            <GeneralSettings />
        </div>
    );
}

export default Customize;
