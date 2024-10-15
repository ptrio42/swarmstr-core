import {useCallback, useEffect, useMemo, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {uniqBy} from "lodash";

import {useElementIsVisible} from "./use-element-is-visible";
import {EventKind} from "../models/commons";
import {useSigning} from "../providers/SigningProvider";
import {getZapTotal} from "../services/nostr/zap";
import {useEventLoader} from "./use-event-loader";

export const useEventZaps = (eventId: string, containerRef?: any) => {
    const eventLoader = useEventLoader<NostrEvent>();
    const {user} = useSigning();

    const [zaps, setZaps] = useState<NostrEvent[]>([]);

    const visible = useElementIsVisible(containerRef);

    const handleUpdateZaps = useCallback((events: NostrEvent[]) => {
        console.log('useEventZaps', {events});
        if (events && events.length > 0) setZaps(events);
    }, [eventId]);

    const handleEvents = () => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleUpdateZaps);
    };

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setZaps([]);
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

    const requestZaps = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents({ '#e': [eventId], kinds: [EventKind.ZapReceipt]})
            .then(handleUpdateZaps);
    }, [eventId]);

    const zapCount = useMemo(() => {
        return uniqBy(zaps, 'pubkey').length;
    }, [zaps]);

    const zapTotal = useMemo(() => {
        return getZapTotal(zaps);
    }, [zaps]);

    const zapped = useMemo(() => {
        if (!user?.pubkey) return false;
        return !!zaps
            .find((r1: any) => r1.pubkey === user!.pubkey);
    }, [zaps]);

    return {
        zaps,
        requestZaps,
        zapCount,
        zapped,
        zapTotal
    };
};