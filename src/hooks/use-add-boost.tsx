import {NDKEvent, NDKRelaySet, NDKTag} from "@nostr-dev-kit/ndk";

import {NostrEvent} from "nostr-tools/lib/types/core";
import {useNDK} from "../providers/NDKProvider";
import {EventKind} from "../models/commons";
import {useRelays} from "../providers/RelaysProvider";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useAddBoost = (event: NostrEvent) => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();
    const {setSnackbarMessage} = useSnackbar();

    return async (relayUrls?: string[]) => {
        const {pubkey, id} = event;
        const newEvent = new NDKEvent(ndk);
        newEvent.kind = EventKind.Boost;
        newEvent.content = JSON.stringify(event);
        newEvent.tags = [
            ['e', id!],
            ['p', pubkey]
        ];

        newEvent.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Boosted!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to boost event' });
                return Promise.resolve();
            })
    };
};