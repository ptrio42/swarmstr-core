import {NostrEvent} from "nostr-tools/lib/types/core";
import {Metadata} from "../Metadata/Metadata";
import React, {useState} from "react";
import {Stack} from "@mui/material";
import Box from "@mui/material/Box";
import {MoreHoriz} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

const DEFAULT_MAX_ENGAGEMENTS = 6;

export const EventEngagements = (
    {
        events,
        iconElement,
        customPubkeyHandler = () => undefined,
        customBadgeHandler = () => undefined
    }: {
        events: NostrEvent[],
        iconElement: any,
        customPubkeyHandler?: (event: NostrEvent) => string|undefined,
        customBadgeHandler?: (event: NostrEvent) => string|undefined
    }) => {

    const [visibleEngagementsNo, setVisibleEngagementsNo] = useState(DEFAULT_MAX_ENGAGEMENTS);

    if (events.length === 0) return;

    const showAllEngagements = () => {
        setVisibleEngagementsNo(events.length);
    };

    return <Stack sx={{width: '100%', marginBottom: '0.5em'}} direction="row">
        <Box
            sx={{
                minWidth: '50px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>{ iconElement }</Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {
                events
                    .slice(0, visibleEngagementsNo)
                    .map((event: NostrEvent) => <Metadata
                        variant="avatar"
                        pubkey={customPubkeyHandler(event!) ?? event!.pubkey}
                        badge={
                            <Box sx={{color: '#ffdf00', textShadow: '1px 1px #000'}}>
                                {customBadgeHandler(event) ?? event!.content}
                            </Box>
                        }
                    />)
            }
        </Box>
        {
            events.length > visibleEngagementsNo &&
            <Badge
                color="primary"
                badgeContent={events.length-visibleEngagementsNo}
            >
                <IconButton onClick={showAllEngagements} size="small">
                    <MoreHoriz/>
                </IconButton>
            </Badge>
        }
    </Stack>
};