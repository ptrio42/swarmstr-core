import {NostrEvent} from "nostr-tools";
import {NDKEvent} from "@nostr-dev-kit/ndk";

import {EventLoader, EventLoaderOpts} from "../classes/EventLoader";
import {useSubscriptionManager} from "../providers/SubscriptionManagerProvider";

export const useEventLoader = <T extends NostrEvent|NDKEvent>(opts?: EventLoaderOpts) => {
    const subscriptionManager = useSubscriptionManager();

    //@ts-ignore
    return new EventLoader<T>(subscriptionManager, {
        ...opts,
        //@ts-ignore
        // ...(cachedEvents && { initialEvents: cachedEvents})
    });
};