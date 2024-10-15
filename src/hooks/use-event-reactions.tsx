import React, {useCallback, useEffect, useMemo, useState} from "react";

import {NostrEvent} from "nostr-tools/lib/types/core";

import {uniqBy,throttle} from "lodash";

import {useElementIsVisible} from "./use-element-is-visible";
import {EventKind} from "../models/commons";
import {useSigning} from "../providers/SigningProvider";
import {useEventLoader} from "./use-event-loader";

export const DEFAULT_UP_REACTION = '+';
export const DEFAULT_DOWN_REACTION = '-';

export const DEFAULT_DOWN_REACTIONS = [
    ['1f6a9', '🚩'],
    ['1f44e', '👎'], ['1f92c', '🤬'],
    ['1f611', '😑'], ['1f595', '🖕'],
    ['1f926-200d-2642-fe0f', '🤦‍♂️‍️']
];

const filterReactionByContent = (reactions: NostrEvent[], filterString: string) => {
    return reactions
        .filter(({content}) => content === filterString);
};

export const useEventReactions = (eventId: string, containerRef?: any) => {
    const eventLoader = useEventLoader<NostrEvent>({name:'useEventReactions',groupable:true});
    const {user} = useSigning();

    const [reactions, setReactions] = useState<NostrEvent[]>([]);

    const visible = useElementIsVisible(containerRef);

    const handleUpdateReactions = useCallback((events: NostrEvent[]) => {
        console.log('useEventReactions', {events});
        if (events && events.length > 0) setReactions(events);
    }, [eventId]);

    const handleEvents = useCallback(() => {
        eventLoader
        // @ts-ignore
            .requestEvents()
            .then(handleUpdateReactions);
    }, [eventId]);

    useEffect(() => {
        eventLoader
            .on('newEvent', handleEvents);

        return () => {
            eventLoader.stopLoading();
            setReactions([]);
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

    const requestReactions = useCallback(() => {
        console.log('useEventReactions: requesting reactions...');
        eventLoader
        // @ts-ignore
            .requestEvents({ '#e': [eventId], kinds: [EventKind.Reaction]})
            .then(handleUpdateReactions);
    }, [eventId]);

    const reactionCount = useMemo(() => {
        return uniqBy(reactions, 'pubkey').length;
    }, [reactions]);

    const reacted = useMemo(() => {
        if (!user?.pubkey) return false;
        return !!reactions
            .find((r1: any) => r1.pubkey === user!.pubkey);
    }, [reactions, user?.pubkey]);

    return {
        reactions,
        requestReactions,
        reactionCount,
        reacted
    };
};