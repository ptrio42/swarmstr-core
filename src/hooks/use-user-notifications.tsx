import React, {useCallback, useEffect, useState} from "react";

import {NostrEvent} from "nostr-tools/lib/types/core";
import {useEventLoader} from "./use-event-loader";
import {EventKind} from "../models/commons";
import {useMuteList} from "../providers/MuteListProvider";

export const NOTIFICATIONS_KINDS = [
    EventKind.Note,
    EventKind.Boost,
    EventKind.Reaction,
    EventKind.BadgeAward,
    EventKind.LongForm,
    EventKind.ZapReceipt
];

export const useUserNotifications = (pubkey: string) => {
    const eventLoader = useEventLoader<NostrEvent>();
    const {muteTags} = useMuteList();
    eventLoader.muteTags = muteTags;

    const [notifications, setNotifications] = useState<NostrEvent[]>([]);

    const handleRequestNotifications = (events: NostrEvent[]) => {
        console.log('useUserNotifications', {events});
        if (events && events.length > 0) setNotifications(events);
    };

    const handleEvents = () => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleRequestNotifications);
    };

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);
        return () => {
            eventLoader.stopLoading();
            setNotifications([]);
            eventLoader.removeListener('newEvent', handleEvents);
        }
    }, []);

    const requestNotifications = useCallback(() => {
        const weekAgo = Math.floor(Date.now() / 1000 - 7 * 24 * 3600);
        eventLoader
        // @ts-ignore
            .requestEvents({ '#p': [pubkey], kinds: NOTIFICATIONS_KINDS, since: weekAgo })
            .then(handleRequestNotifications);
    }, [pubkey]);

    return {
        notifications,
        requestNotifications
    };
};