import React, {useCallback, useEffect, useMemo, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKTag} from "@nostr-dev-kit/ndk";

import {useElementIsVisible} from "./use-element-is-visible";
import {useSigning} from "../providers/SigningProvider";
import {EventKind} from "../models/commons";
import {useMuteList} from "../providers/MuteListProvider";
import {useEventLoader} from "./use-event-loader";

export const useEventReplies = (eventId: string, containerRef?: any) => {
    const {user} = useSigning();

    const eventLoader = useEventLoader<NostrEvent>({groupable:true,closeOnEose:false});
    const {muteTags} = useMuteList();
    eventLoader.muteTags = muteTags;

    const [replies, setReplies] = useState<NostrEvent[]>([]);

    const visible = useElementIsVisible(containerRef);

    const handleUpdateReplies = useCallback((events: NostrEvent[]) => {
        if (events && events.length > 0) setReplies(events);
    }, [eventId]);

    const handleEvents = () => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleUpdateReplies);
    };

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setReplies([]);
            eventLoader.removeListener('newEvent', handleEvents)
        }
    }, []);

    useEffect(() => {
        if (visible) {
            console.log(`useEventReplies loading replies for thread ${eventId}`);
            // eventLoader.startLoading();
        } else {
            // eventLoader.stopLoading();
        }
    }, [visible]);

    const requestReplies = useCallback(() => {
        eventLoader
            .requestEvents({
                '#e': [eventId],
                // @ts-ignore
                kinds: [EventKind.Note, EventKind.LongForm]
            })
            .then(handleUpdateReplies);
    }, [eventId]);

    const repliesCount = useMemo(() => {
        return replies.length;
    }, [replies, muteTags]);

    const replied = useMemo(() => {
        if (!user?.pubkey) return false;
        return !!replies
            .find((r1: any) => r1.pubkey === user!.pubkey);
    }, [replies, user?.pubkey]);

    return {
        replies,
        requestReplies,
        repliesCount,
        replied
    };
};