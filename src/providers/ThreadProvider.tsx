import React, {createContext, useContext, useEffect, useMemo, useRef} from "react";
import {NostrEvent} from "nostr-tools";
import {Sort} from "../components/EventList/EventList";
import {Box} from "@mui/material";
import {decodeBech32Entity, getEventTree} from "../helpers/nostr/event";
import {useEventReplies} from "../hooks/use-event-replies";
import {useEvent} from "../hooks/use-event";
import {useEventReactions} from "../hooks/use-event-reactions";
import {useEventBoosts} from "../hooks/use-event-boosts";
import {useEventZaps} from "../hooks/use-event-zaps";
import {useEventLabels} from "../hooks/use-event-labels";
import {useElementIsVisible} from "../hooks/use-element-is-visible";
import {useEventRelays} from "../hooks/use-event-relays";
import {useEventDeletion} from "../hooks/use-event-deletion";
import {useEventCache} from "./EventCacheProvider";
import {RelayInformation} from "../models/commons";

type ThreadContextType = {
    eventStore?: any,
    events?: NostrEvent[],
    nevent: string,
    id: string;
    pubkey?: string;
    kind?: number;
    event?: NostrEvent;
    visible?: boolean;
    replies: NostrEvent[];
    repliesCount?: number;
    replied?: boolean;
    reactions: NostrEvent[];
    reactionCount?: number;
    requestReactions: () => void;
    reacted?: boolean;
    boosts: NostrEvent[];
    boosted?: boolean;
    boostCount?: number;
    zaps: NostrEvent[];
    zapped?: boolean;
    zapCount?: number;
    zapTotal?: number;
    labels?: NostrEvent[];
    depth: number;
    relays: RelayInformation[];
    deletion?: NostrEvent;
}

export const ThreadContext = createContext<ThreadContextType>({
    nevent: '',
    id: '',
    depth: 0,
    replies: [],
    reactions: [],
    boosts: [],
    zaps: [],
    labels: [],
    relays: [],
    requestReactions: () => {}
});

interface ThreadProviderProps {
    children: any,
    event?: NostrEvent,
    nevent?: string,
    sort?: Sort,
    bech32String?: string;
    id?: string;
    depth?: number;
}

const ThreadProvider = ({children, sort = Sort.RECENT, bech32String, depth = 0, ...props}: ThreadProviderProps) => {

    const id = props.id || props.event?.id || decodeBech32Entity(bech32String || '')?.id;

    if (!id) return;

    const threadRef = useRef<any>(null);
    const { event, requestEvent } = useEvent(id);
    const eventReplies = useEventReplies(id, threadRef);
    const eventReactions = useEventReactions(id, threadRef);
    const eventBoosts = useEventBoosts(id, threadRef);
    const eventZaps = useEventZaps(id, threadRef);
    const eventLabels = useEventLabels(id, threadRef);
    const eventRelays = useEventRelays(id);
    const eventDeletion = useEventDeletion(id);

    const tree = useMemo(() => event ? getEventTree(event!) : [], [id, event]);

    const visible = useElementIsVisible(threadRef);

    const eventCache = useEventCache();

    useEffect(() => {
        if (visible) {
            console.log(`ThreadProvider: visible thread ${id}`);
            if (!props?.event) requestEvent();
            eventBoosts.requestBoosts();
            eventReactions.requestReactions();
            eventReplies.requestReplies();
            eventZaps.requestZaps();
            eventLabels.requestLabels();
            setTimeout(eventRelays.requestRelays, 1000);
            eventDeletion.requestDeletions();

            // if (eventCache.getLastItemId() === id) {
            //     threadRef.current.scrollIntoView();
            // }
        } else {}
    }, [visible]);

    useEffect(() => {
        if (!threadRef.current || (!event && !props.event)) return;

        const resizeObserver = new ResizeObserver(() => {
            if(threadRef.current.offsetHeight !== eventCache.getItem(id)?.height) {
                //@ts-ignore
                // eventCache.addItem(location.pathname, props.event || event, threadRef.current.offsetHeight);
            }
        });
        resizeObserver.observe(threadRef.current);

        return () => {
            resizeObserver.disconnect();
        }
    }, [threadRef.current, event]);

    useEffect(() => {
        return () => {
        }
    }, []);

    return <Box sx={{ width: '100%' }} ref={threadRef}>
        <ThreadContext.Provider
            // @ts-ignore
            value={{
                id,
                visible,
                event: props.event || event,
                depth: depth + tree.length,
                ...eventReplies,
                ...eventReactions,
                ...eventBoosts,
                ...eventZaps,
                ...eventLabels,
                ...eventRelays,
                ...eventDeletion
            }}
        >
            {children}
        </ThreadContext.Provider>
    </Box>
};

export const useThread = () => useContext(ThreadContext);

export default ThreadProvider;