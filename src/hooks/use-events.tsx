import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {useEventLoader} from "./use-event-loader";

export const useEvents = () => {
    const eventLoader = useEventLoader<NostrEvent>();

    const [events, setEvents] = useState<NostrEvent[]>([]);

    const handleRequestEvents = (events: NostrEvent[]) => {
        if (events && events.length > 0) setEvents(events);
    };

    const requestEvents = useCallback((eventIds: string[]) => {
        eventLoader
        // @ts-ignore
            .requestEvents({ 'ids': eventIds})
            .then(handleRequestEvents);
    }, []);

    return {
        events,
        requestEvents
    };
};