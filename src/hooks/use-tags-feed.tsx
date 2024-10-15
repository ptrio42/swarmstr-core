import React, {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {uniqBy} from "lodash";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";

const DEFAULT_LIMIT = 10;

export const useTagsFeed = (tags: string | string[]) => {
    const eventLoader = useEventLoader<NostrEvent>({closeOnEose:true,groupable:true,throttled:false});

    const [notes, setNotes] = useState<NostrEvent[]>([]);
    const [newNotes, setNewNotes] = useState<NostrEvent[]>([]);

    const handleRequestTagsFeedSuccess = useCallback((events: NostrEvent[]) => {
        console.log('useTagsFeed handleRequestTagsFeedSuccess', {events});
        if (events && events.length > 0) setNotes(uniqBy([
            ...notes,
            ...events
        ], 'id'));
    }, [tags]);

    const handleRequestTagsFeedFailure = (error: any) => {
        console.error('useTagsFeed: error', {error});
    };

    const requestFeed = useCallback((until?: number) => {
        // const now = Math.floor(Date.now() / 1000);
        // const since = now - 7 * 24 * 60 * 60;
        const filter = {
            kinds: [EventKind.Note, EventKind.LongForm],
            '#t': Array.isArray(tags) ? tags : [tags],
            limit: DEFAULT_LIMIT,
            ...(until && {until})
            // since
        };

        console.log('useTagsFeed requestFeed', {filter});

        eventLoader
        // @ts-ignore
            .requestEvents(filter)
            .then(handleRequestTagsFeedSuccess)
            .catch(handleRequestTagsFeedFailure);
    }, [tags]);

    const handleNewTagsFeedNote = (event: NostrEvent) => {};

    useEffect(() => {
        // eventLoader
        //     .on('newEvent', handleNewTagsFeedNote);

        return () => {
            eventLoader.stopLoading();
            setNotes([]);
        }
    }, []);

    return {
        //@ts-ignore
        notes,
        requestFeed
    };
};