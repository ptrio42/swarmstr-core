import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";

export const useMetadataEvent = (pubkey: string) => {
    const eventLoader = useEventLoader<NostrEvent>({closeOnEose:true,groupable:true,throttled:false});

    const [event, setEvent] = useState<NostrEvent>();

    const handleRequestEvent = (events: NostrEvent[]) => {
        if (events && events.length > 0) setEvent(events[0]);
    };

    const requestEvent = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents({ kinds: [EventKind.Metadata], authors: [pubkey]})
            .then(handleRequestEvent);
    }, [pubkey]);

    useEffect(() => {
        return () => {
            eventLoader.stopLoading();
            setEvent(undefined);
        }
    }, []);

    return {
        event,
        requestEvent
    };
};