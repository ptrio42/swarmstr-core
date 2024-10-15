import {useCallback, useState} from "react";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {EventKind} from "../models/commons";
import {useEventLoader} from "./use-event-loader";


export const useBadgeDefinitions = (dTags?: string[]) => {
    const eventLoader = useEventLoader<NostrEvent>();

    const [badgeDefinitions, setBadgeDefinitions] = useState<NostrEvent[]>([]);

    const handleRequestBadgeAwards = (events: NostrEvent[]) => {
        if (events && events.length > 0) setBadgeDefinitions(events);
    };

    const requestBadgeDefinitions = useCallback(() => {
        if (!dTags) return;
        console.log(`useBadgeDefinitions: dTags: ${dTags?.length}`, {dTags});
        eventLoader
        // @ts-ignore
            .requestEvents({ kinds: [EventKind.BadgeDefinition], '#d': dTags })
            .then(handleRequestBadgeAwards);
    }, [dTags]);

    return {
        badgeDefinitions,
        requestBadgeDefinitions
    };
};