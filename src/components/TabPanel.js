import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

const TabPanel = ({ children, value, onChange, tabs }) => (
    <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={(_, newValue) => onChange(newValue)}>
                {tabs.map((tab, index) => (
                    <Tab key={index} icon={tab.icon} label={tab.label} />
                ))}
            </Tabs>
        </Box>
        <Box sx={{ p: 3 }}>
            {children}
        </Box>
    </Box>
);

export default TabPanel;