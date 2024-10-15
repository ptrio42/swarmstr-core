import {NDKTag} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools";
import React, {createContext, memo, useCallback, useContext, useEffect, useState} from "react";
import {Sort} from "../components/EventList/EventList";
import {getEventsStats} from "../services/nostr/helpers";

type EventListContextType = {
    events?: NostrEvent[];
    limit: number;
    setLimit: (limit: number) => void;
    sort?: Sort;
    setSort: (sort: Sort) => void;
    eventStore?: any;
}

export const EventListContext = createContext<EventListContextType>({
    limit: 10,
    setLimit: () => {},
    setSort: () => {},
    eventStore: {}
});

interface EventListProviderProps {
    children?: any;
    events?: NostrEvent[];
    limit?: number;
    sort?: Sort;
    tag?: NDKTag;
    eventStore?: any;
}

const EventListProvider = ({ children, events = [], ...props }: EventListProviderProps) => {

    const [limit, setLimit] = useState<number>(props?.limit || 10);
    const [sort, setSort] = useState<Sort>(props.sort || Sort.RECENT);

    const [stats, setStats] = useState<any>({});

    const requestStats = useCallback(() => {
        const ids = events.map(({id}) => id);
        getEventsStats(ids)
            .then((_stats: any) => {
                setStats(_stats);
            });
    }, [events]);

    useEffect(() => {
        console.log('EventListProvider: stats', sort, stats);
    }, [sort]);

    useEffect(() => {
        requestStats();

        return () => {}
    }, []);

    // @ts-ignore
    return <EventListContext.Provider value={{ events, limit, setLimit, sort, setSort, eventStore: props.eventStore }}>
        { children }
    </EventListContext.Provider>;
};

export const useEventListProvider = () => useContext(EventListContext);
export default EventListProvider;