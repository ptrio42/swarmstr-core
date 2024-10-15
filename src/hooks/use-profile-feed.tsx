import React, {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";
import {useEventCache} from "../providers/EventCacheProvider";
import {useLocation} from "react-router";

const DEFAULT_LIMIT = 10;

export const useProfileFeed = (pubkey: string) => {
    const eventLoader = useEventLoader<NostrEvent>({closeOnEose:true,throttled:false});

    const [notes, setNotes] = useState<NostrEvent[]>([]);

    const location = useLocation();

    const eventCache = useEventCache();

    const handleRequestProfileFeedSuccess = useCallback((events: NostrEvent[]) => {
        if (events && events.length > 0) setNotes(events);
    }, [pubkey]);

    const handleRequestProfileFeedFailure = (error: any) => {
        console.error('useProfileFeed: error', {error});
    };

    const requestFeed = useCallback((opts: { until?: number, limit?: number; } = {}) => {
        const filter = {
            authors: [pubkey],
            kinds: [EventKind.Note, EventKind.LongForm, EventKind.Boost],
            limit: DEFAULT_LIMIT,
            ...(opts.until && {until: opts.until})
            // since
        };

        eventLoader
        // @ts-ignore
            .requestEvents(filter)
            .then(handleRequestProfileFeedSuccess)
            .catch(handleRequestProfileFeedFailure);
    }, [pubkey]);

    const handleNewProfileFeedNote = (event: NostrEvent) => {};

    useEffect(() => {
        eventLoader
            .on('newEvent', handleNewProfileFeedNote);

        // const cache = eventCache.getCache(location.pathname);
        // if (cache) {
        //     const cachedEvents = Array.from(cache.values());
        //     console.log(`useProfileFeed: loading ${cachedEvents} cached events`);
        //     handleRequestProfileFeedSuccess(cachedEvents);
        //     cache.clear();
        // } else {
        //     requestFeed();
        // }
        requestFeed();

        return () => {
            eventLoader.stopLoading();
            setNotes([]);
            eventLoader.removeListener('newEvent', handleNewProfileFeedNote);
            console.log('useProfileFeed: event cache', {eventCache}, eventCache.getCache(location.pathname))
        }
    }, [pubkey]);

    return {
        //@ts-ignore
        notes,
        requestFeed
    };
};