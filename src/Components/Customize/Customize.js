import React from 'react';
import GeneralSettings from './GeneralSettings';
import ContentSettings from './ContentSettings';
import FilterKeywords from './FilterKeywords';
import { Typography } from '@mui/material';

function Customize() {

    return (
        <div>
            <Typography variant="h4" component="div" gutterBottom>
                Settings for customization
            </Typography>
            <GeneralSettings />
            <ContentSettings />
            <FilterKeywords />
        </div>
    );
}

export default Customize;
