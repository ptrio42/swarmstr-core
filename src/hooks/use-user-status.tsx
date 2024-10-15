import React, {useCallback, useEffect, useState} from "react";

import {NostrEvent} from "nostr-tools/lib/types/core";
import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";

export const useUserStatus = (pubkey: string) => {
    const eventLoader = useEventLoader<NostrEvent>();

    const [status, setStatus] = useState<string>();

    const handleEvent = useCallback((event: NostrEvent) => {
        if (event) setStatus(event.content)
    }, [pubkey]);

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvent);
        return () => {
            eventLoader.removeListener('newEvent', handleEvent);
            eventLoader.stopLoading();
        }
    }, []);

    const requestStatus = useCallback(() => {
        if (!status) eventLoader
            // @ts-ignore
            .requestEvents({ kinds: [EventKind.UserStatus], authors: [pubkey] })
            .then((events: NostrEvent[]) => {
                if (events && events.length > 0) setStatus(events[0].content);
            });
    }, [pubkey]);

    const updateStatus = (pubkey: string) => {};

    return {
        status,
        requestStatus
    };
};