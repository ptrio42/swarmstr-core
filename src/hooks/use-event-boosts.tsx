import {EventLoader} from "../classes/EventLoader";
import {useCallback, useEffect, useMemo, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {useElementIsVisible} from "./use-element-is-visible";
import {useNDK} from "../providers/NDKProvider";
import {uniqBy} from "lodash";
import {EventKind} from "../models/commons";
import {useSigning} from "../providers/SigningProvider";
import {useEventLoader} from "./use-event-loader";

export const useEventBoosts = (eventId: string, containerRef?: any) => {
    const eventLoader = useEventLoader<NostrEvent>({groupable:true});
    const {user} = useSigning();

    const [boosts, setBoosts] = useState<NostrEvent[]>([]);

    const visible = useElementIsVisible(containerRef);

    const handleUpdateBoosts = useCallback((events: NostrEvent[]) => {
        console.log('useUserNotifications', {events});
        if (events && events.length > 0) setBoosts(events);
    }, [eventId]);

    const handleEvents = () => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleUpdateBoosts);
    };

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setBoosts([]);
            eventLoader.removeListener('newEvent', handleEvents);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            // eventLoader.startLoading();
        } else {
            // eventLoader.stopLoading();
        }
    }, [visible]);

    const requestBoosts = () => {
        eventLoader
        // @ts-ignore
            .requestEvents({ '#e': [eventId], kinds: [EventKind.Boost]})
            .then(handleUpdateBoosts);
    };

    const boostCount = useMemo(() => {
        return uniqBy(boosts, 'pubkey').length;
    }, [boosts]);

    const boosted = useMemo(() => {
        if (!user?.pubkey) return false;
        return !!boosts
            .find((r1: any) => r1.pubkey === user!.pubkey);
    }, [boosts]);

    return {
        boosts,
        requestBoosts,
        boostCount,
        boosted
    };
};