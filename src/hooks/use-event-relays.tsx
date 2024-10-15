import {useSubscriptionManager} from "../providers/SubscriptionManagerProvider";
import {useCallback, useState} from "react";

import {last} from "lodash";

import {useRelaysInformation} from "../providers/RelayInformationProvider";
import {RelayInformation} from "../models/commons";

export const useEventRelays = (eventId: string) => {
    const subscriptionManager = useSubscriptionManager();
    const relaysInformation = useRelaysInformation();

    const [relays, setRelays] = useState<RelayInformation[]>([]);

    const requestRelays = useCallback(() => {
        console.log('useEventRelays', {relaysInformation, seen: subscriptionManager.eventSeenOn(eventId)})
        const relayUrls: string[] = subscriptionManager.eventSeenOn(eventId) || [];
        const _relays = relaysInformation
            .filter(({url}) => relayUrls
                .includes(`${url.replace('https', 'wss')}${last(url) === '/' ? '' : '/'}`));
        setRelays(_relays);
    }, [eventId, relaysInformation]);

    return {
        relays,
        requestRelays
    };
};