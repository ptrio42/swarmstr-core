import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {useEventLoader} from "./use-event-loader";
import {EventKind} from "../models/commons";

export const useEventDeletion = (eventId: string) => {
    const eventLoader = useEventLoader<NostrEvent>();

    const [deletion, setDeletion] = useState<NostrEvent>();

    const handleRequestDeletions = useCallback((events: NostrEvent[]) => {
        if (events && events.length > 0) setDeletion(events[0]);
    }, [eventId]);

    const requestDeletions = useCallback(() => {
        eventLoader
            //@ts-ignore
            .requestEvents({ kinds: [EventKind.DeletionRequest], '#e': [eventId] })
            .then(handleRequestDeletions);
    }, [eventId]);

    useEffect(() => {
        return () => {
            eventLoader.stopLoading();
            setDeletion(undefined);
        };
    }, []);

    return {
        deletion,
        requestDeletions
    };
};