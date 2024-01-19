import React from 'react';
import GeneralSettings from './GeneralSettings';
import ContentSettings from './ContentSettings';
import FilterKeywords from './FilterKeywords';

function Customize() {

    return (
        <div>
            <GeneralSettings />
            <ContentSettings />
            <FilterKeywords />
        </div>
    );
}

export default Customize;
