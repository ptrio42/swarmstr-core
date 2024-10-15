import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {useEventLoader} from "./use-event-loader";
import {useSubscriptionManager} from "../providers/SubscriptionManagerProvider";

const processQuery = (query: string) => {
    return query
        .trim()
        .toLowerCase();
};

const SEARCH_RELAYS = ['wss://questions.swarmstr.com'];

export const useSearch = () => {
    const eventLoader = useEventLoader<NostrEvent>({groupable:false,closeOnEose:true});
    const subManager = useSubscriptionManager();

    const [events, setEvents] = useState<NostrEvent[]>();

    const handleRequestEvent = useCallback((events: NostrEvent[]) => {
        if (events && events.length > 0) setEvents(events);
    }, []);

    const requestEvents = useCallback((query: string) => {
        if (eventLoader.loading) eventLoader.stopLoading();

        eventLoader
        // @ts-ignore
            .requestEvents({ search: processQuery(query)}, SEARCH_RELAYS)
            .then(handleRequestEvent);
    }, []);

    const stopRequestEvents = useCallback(() => {
        if (eventLoader.loading) eventLoader.stopLoading();
    }, []);

    useEffect(() => {
        subManager.addRelaysToPool(SEARCH_RELAYS);

        return () => {
            eventLoader.stopLoading();
        }
    }, []);

    return {
        events,
        requestEvents,
        stopRequestEvents,
        searchInProgress: eventLoader.loading
    };
};