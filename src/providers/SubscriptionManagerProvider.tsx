import React, {createContext, useContext} from "react";
import NDK from "@nostr-dev-kit/ndk";

import {SubscriptionManager} from "../classes/SubscriptionManager";
import {useNDK} from "./NDKProvider";

const SubscriptionManagerContext = createContext<SubscriptionManager>(new SubscriptionManager(new NDK()));

export const SubscriptionManagerProvider = ({children}:{children:any}) => {
    const ndk = useNDK();
    const subscriptionManager = new SubscriptionManager(ndk);

    return <SubscriptionManagerContext.Provider value={subscriptionManager}>
        {children}
    </SubscriptionManagerContext.Provider>
};

export const useSubscriptionManager = () => useContext(SubscriptionManagerContext);