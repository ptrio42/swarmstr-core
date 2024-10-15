import React from "react";
import {NostrEvent} from "nostr-tools";

import {Box} from "@mui/material";
import {EventListWrapper} from "../EventListWrapper/EventListWrapper";
import EventListProvider from "../../providers/EventListProvider";
import EventList from "../EventList/EventList";
import Typography from "@mui/material/Typography";
import {NOTIFICATIONS_KINDS} from "../../hooks/use-user-notifications";

export const Notifications = ({ notifications }: { notifications: NostrEvent[] }) => {
    return <Box sx={{ marginTop: '8px', padding: '0 3px' }}>
        <Typography component="div" variant="h6">Notifications</Typography>
        <EventListProvider limit={50} events={notifications}>
            <EventListWrapper>
                <EventList kinds={NOTIFICATIONS_KINDS} expanded={false} />
            </EventListWrapper>
        </EventListProvider>
    </Box>
};