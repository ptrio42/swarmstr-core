import {useCallback, useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {EventKind} from "../models/commons";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {useEventLoader} from "./use-event-loader";

export const useBadgeAwards = (eventIds?: string[]) => {
    const eventLoader = useEventLoader<NostrEvent>();

    const [badgeAwards, setBadgeAwards] = useState<NostrEvent[]>([]);

    const handleRequestBadgeAwards = (events: NostrEvent[]) => {
        if (events && events.length > 0) setBadgeAwards(events);
    };

    const requestBadgeAwards = useCallback(() => {
        if (!eventIds) return;

        eventLoader
        // @ts-ignore
            .requestEvents({ kinds: [EventKind.BadgeAward], ids: eventIds })
            .then(handleRequestBadgeAwards);
    }, [eventIds]);

    return {
        badgeAwards,
        requestBadgeAwards
    };
};