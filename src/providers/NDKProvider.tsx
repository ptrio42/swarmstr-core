import React, {createContext, useContext, useEffect, useRef} from "react";
import NDK, {NDKNip07Signer, NDKSigner} from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

import {DEFAULT_USER_RELAYS} from "../services/nostr/relays";
import {getFlatUserRelays} from "../services/nostr/helpers";

const NDKContext = createContext<NDK>(new NDK());

export const NDKProvider = ({ children }: { children: any }) => {
    const cacheAdapter = new NDKCacheAdapterDexie({
        dbName: 'swarmstrDB_cache_1',
        eventCacheSize: 100000
    });

    const ndk = useRef<NDK>(new NDK({
        clientName: 'swarmstr',
        explicitRelayUrls: getFlatUserRelays(DEFAULT_USER_RELAYS),
        cacheAdapter
    }));

    useEffect(() => {
        ndk.current.connect(5000)
            .then(() => {
                console.log('NDKProvider: initially connected to relays');
            });
    }, []);

    return <NDKContext.Provider value={ndk.current}>
        {children}
    </NDKContext.Provider>;
};

export const useNDK = () => useContext(NDKContext);