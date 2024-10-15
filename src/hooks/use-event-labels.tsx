import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {useElementIsVisible} from "./use-element-is-visible";
import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";

export const useEventLabels = (eventId: string, containerRef?: any) => {
    const eventLoader = useEventLoader<NostrEvent>({groupable:true});

    const [labels, setLabels] = useState<NostrEvent[]>([]);

    const visible = useElementIsVisible(containerRef);

    const handleUpdateLabels = useCallback((events: NostrEvent[]) => {
        if (events && events.length > 0) setLabels(events);
    }, [eventId]);

    const handleEvents = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleUpdateLabels);
    }, [eventId]);

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setLabels([]);
            eventLoader.removeListener('newEvent', handleEvents);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            // eventLoader.startLoading();
        } else {
            // eventLoader.stopLoading();
        }
    }, [visible]);

    const requestLabels = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents({ '#e': [eventId], kinds: [EventKind.Label]})
            .then(handleUpdateLabels);
    }, [eventId]);

    return {
        labels,
        requestLabels
    };
};