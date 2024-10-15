import React from "react";

import {Box} from "@mui/material";
import Typography from "@mui/material/Typography";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    name?: string;
}

export const a11yProps = (name: string = 'panel', index: number) => {
    return {
        id: `simplnewNote-tab-${index}`,
        'aria-controls': `newNote-tabpanel-${index}`,
    };
};

export const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, name = 'panel', ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`${name}-tabpanel-${index}`}
            aria-labelledby={`${name}-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};