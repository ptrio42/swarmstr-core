import React from "react";

import {Stack} from "@mui/material";
import Box from "@mui/material/Box";
import {Language} from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";

import {RelayInformation} from "../models/commons";

export const EventRelays = (
    {
        relaysInfo
    }: {
        relaysInfo: RelayInformation[],
    }) => {
    if (relaysInfo.length === 0) return;

    return <Stack sx={{width: '100%', marginBottom: '0.5em'}} direction="row">
        <Box
            sx={{
                minWidth: '50px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}><Language sx={{ color: '#000', fontSize: 27 }} /></Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {
                relaysInfo
                    ?.map((relayInfo: RelayInformation) => <Tooltip  title={relayInfo.name}>
                        <Avatar
                            imgProps={{ height: '30' }}
                            sx={{ width: '30px', height: '30px', margin: '2px' }}
                            alt={relayInfo.description}
                            src={relayInfo.icon} />
                    </Tooltip>)
            }
        </Box>
    </Stack>
};