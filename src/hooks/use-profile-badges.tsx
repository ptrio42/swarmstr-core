import {useCallback, useEffect, useState} from "react";
import {useNDK} from "../providers/NDKProvider";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {EventKind} from "../models/commons";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {useEventLoader} from "./use-event-loader";

const PROFILE_BADGES = ['profile_badges'];

export const useProfileBadges = (pubkey: string) => {
    const ndk = useNDK();
    const eventLoader = useEventLoader<NostrEvent>();

    const [profileBadges, setProfileBadges] = useState<NostrEvent>();

    const handleRequestProfileBadges = (events: NostrEvent[]) => {
        if (events && events.length > 0) {
            setProfileBadges(events[0]);
        }
    };

    const requestProfileBadges = useCallback(() => {
        console.log(`useProfileBadges: requestProfileBadges`);
        eventLoader
        // @ts-ignore
            .requestEvents({ kinds: [EventKind.ProfileBadges], authors: [pubkey], '#d': PROFILE_BADGES })
            .then(handleRequestProfileBadges);
    }, [pubkey]);

    const handleNewProfileBadge = (event: NostrEvent) => {
        setProfileBadges(event);
    };

    useEffect(() => {
        eventLoader
            .on('newEvent', handleNewProfileBadge);

        return () => {
            eventLoader.stopLoading();
            setProfileBadges(undefined);
            eventLoader.removeListener('newEvent', handleNewProfileBadge);
        }
    }, []);

    return {
        profileBadges,
        requestProfileBadges
    };
};