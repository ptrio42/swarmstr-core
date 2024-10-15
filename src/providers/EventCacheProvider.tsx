import React, {createContext, useContext} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKEvent} from "@nostr-dev-kit/ndk";

import {EventCache} from "../classes/EventCache";

const EventCacheContext = createContext<EventCache>(new EventCache());

export const EventCacheProvider = ({children}:{children:any}) => {
    const eventCache = new EventCache();

    return <EventCacheContext.Provider value={eventCache}>
        {children}
    </EventCacheContext.Provider>
};

export const useEventCache = () => useContext(EventCacheContext);