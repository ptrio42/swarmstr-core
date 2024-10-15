import React, {useCallback, useEffect, useState} from "react";
import {NDKList, NDKEvent} from "@nostr-dev-kit/ndk";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";

type ListQuery = {
    ids?: string|string[],
    dTags?: string|string[],
    kind?: EventKind,
    author?: string;
}

export const useList = ({query:{ids, dTags, kind, author}}: {query: ListQuery}) => {
    //@ts-ignore
    const eventLoader = useEventLoader<NDKEvent>({castNDKEventsToNostrEvents: false});

    const [list, setList] = useState<NDKList[]>([]);

    const handleRequestList = (events: NDKEvent[]) => {
        setList(events.map(event => NDKList.from(event)));
    };

    const handleEvents = () => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleRequestList);
    };

    const requestList = useCallback(() => {
        if (
            (!ids || (Array.isArray(ids) && ids.length === 0)) &&
            (!dTags || (Array.isArray(dTags) && dTags.length === 0)) &&
            (!kind || !author)) return;
        eventLoader
            //@ts-ignore
            .requestEvents({
                ...(ids && {ids: Array.isArray(ids) ? ids : [ids]}),
                ...(kind && { kinds: [kind]}),
                ...(dTags && { '#d': Array.isArray(dTags) ? dTags : [dTags] }),
                ...(author && { authors: [author] })
            })
            .then(handleRequestList);
    }, [ids, dTags, kind, author]);

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setList([]);
            eventLoader.removeListener('newEvent', handleEvents)
        }
    }, []);

    return {
        requestList,
        list
    };
};