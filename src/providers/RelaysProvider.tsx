import {EventLoader} from "../classes/EventLoader";
import {NostrEvent} from "nostr-tools/lib/types/core";
import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {DEFAULT_USER_RELAYS} from "../services/nostr/relays";
import {getUserRelays} from "../services/nostr/user";
import {useNDK} from "./NDKProvider";
import {EventKind} from "../models/commons";
import {NDKKind} from "@nostr-dev-kit/ndk/dist";
import {useSigning} from "./SigningProvider";
import {useEventLoader} from "../hooks/use-event-loader";

interface Relays {
    readRelays: string[],
    writeRelays: string[]
}

const RelaysContext = createContext<{ relays: Relays }>({ relays: DEFAULT_USER_RELAYS });

export const RelaysProvider = ({children}: { children: any }) => {
    const ndk = useNDK();
    const {user} = useSigning();

    const eventLoader = useEventLoader<NostrEvent>();

    const [relays, setRelays] = useState<Relays>(DEFAULT_USER_RELAYS);

    useEffect(() => {
        console.log('useUserRelays: pubkey changed', {user: ndk.activeUser});
        requestRelays();
    }, [user]);

    useEffect(() => {
        relays.readRelays
            .forEach((url: string) => {
                if (!ndk.pool.relays.get(url)) {
                    ndk.addExplicitRelay(url);
                }
            })
    }, [relays]);

    const handleRequestRelays = (events: NostrEvent[]) => {
        console.log('useUserRelays', {events})
        if (events && events.length > 0) {
            const newRelays = getUserRelays(events[0]);
            setRelays(newRelays);
            // eventLoader.stopLoading();
        }
    };

    const requestRelays = useCallback(() => {
        const pubkey = user?.pubkey;
        console.log('RelaysProvider: user', {user});
        if (pubkey) {
            eventLoader
                //@ts-ignore
                .requestEvents({ kinds: [EventKind.FollowList as NDKKind], authors: [pubkey] })
                .then(handleRequestRelays);
        }
    }, []);

    return <RelaysContext.Provider value={{ relays }}>
        {children}
    </RelaysContext.Provider>
};

export const useRelays = () => useContext(RelaysContext);