import React, { useState, useEffect } from 'react';
import GeneralSettings from './GeneralSettings';
import ContentSettings from './ContentSettings';
import FilterKeywords from './FilterKeywords';

function Customize() {

    return (
        <div>
            <h1>Customize your web experience</h1>
            <GeneralSettings />
            <ContentSettings />
            <FilterKeywords />
        </div>
    );
}

export default Customize;
