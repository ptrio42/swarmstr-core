import React, {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {uniqBy} from "lodash";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";
import {useSubscriptionManager} from "../providers/SubscriptionManagerProvider";

const DEFAULT_LIMIT = 10;



export const useRelayFeed = (relayUrls: string | string[]) => {
    const eventLoader = useEventLoader<NostrEvent>({closeOnEose:true,groupable:true,throttled:false});
    const subManager = useSubscriptionManager();

    const [notes, setNotes] = useState<NostrEvent[]>([]);
    const [newNotes, setNewNotes] = useState<NostrEvent[]>([]);

    const urls = (Array.isArray(relayUrls) ? relayUrls : [relayUrls]).map(url => `wss://${url}`);

    const handleFilterByRelayUrl = useCallback(({id}: NostrEvent) => {
        const seenOn = subManager.eventSeenOn(id);
        console.log('filterByRelayUrl', seenOn, relayUrls, urls)
        return seenOn.filter((relayUrl) => urls.includes(relayUrl.slice(0,-1))).length > 0
    }, [relayUrls]);

    const handleRequestRelayFeedSuccess = useCallback((events: NostrEvent[], newNote = false) => {
        console.log('useRelayFeed handleRequestRelayFeedSuccess', {events, relayUrls, });
        if (events?.length > 0) {
            const uniqNotes = uniqBy([
                ...notes,
                ...events
            ], 'id')
                .filter(handleFilterByRelayUrl);
            newNote ? setNewNotes(uniqNotes) : setNotes(uniqNotes);
        }
    }, [relayUrls]);

    const handleRequestRelayFeedFailure = (error: any) => {
        console.error('useRelayFeed: error', {error});
    };

    const requestFeed = useCallback((until?: number) => {
        // const now = Math.floor(Date.now() / 1000);
        // const since = now - 7 * 24 * 60 * 60;
        const filter = {
            kinds: [EventKind.Note, EventKind.LongForm],
            limit: DEFAULT_LIMIT,
            ...(until && {until})
            // since
        };

        console.log('useRelayFeed requestFeed', {filter});

        eventLoader
        // @ts-ignore
            .requestEvents(filter, urls)
            .then(handleRequestRelayFeedSuccess)
            .catch(handleRequestRelayFeedFailure);
    }, [relayUrls]);

    const handleNewRelayFeedNote = (event: NostrEvent) => {
        handleRequestRelayFeedSuccess([event]);
    };

    useEffect(() => {
        subManager.addRelaysToPool(urls);

        eventLoader
            .on('newEvent', handleNewRelayFeedNote);

        return () => {
            eventLoader.stopLoading();
            setNotes([]);
            eventLoader.removeListener('newEvent', handleNewRelayFeedNote);
        }
    }, []);

    return {
        //@ts-ignore
        notes,
        requestFeed,
        newNotes
    };
};