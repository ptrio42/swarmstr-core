import {useCallback, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {useEventLoader} from "./use-event-loader";

export const useEvent = (eventId: string) => {
    const eventLoader = useEventLoader<NostrEvent>({groupable:true,closeOnEose:true});

    const [event, setEvent] = useState<NostrEvent>();

    const handleRequestEvent = (events: NostrEvent[]) => {
        if (events && events.length > 0) setEvent(events[0]);
    };

    const requestEvent = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents({ 'ids': [eventId]})
            .then(handleRequestEvent);
    }, [eventId]);

    return {
        event,
        requestEvent
    };
};