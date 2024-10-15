import {NDKEvent, NDKRelaySet, NDKTag} from "@nostr-dev-kit/ndk";

import {useNDK} from "../providers/NDKProvider";
import {EventKind} from "../models/commons";
import {useRelays} from "../providers/RelaysProvider";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useAddNote = () => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();
    const {setSnackbarMessage} = useSnackbar();

    return async (content: string, tags: NDKTag[], kind: number = EventKind.Note, relayUrls?: string[]) => {
        const event = new NDKEvent(ndk);
        event.kind = kind;
        event.content = content;
        event.tags = [
            ...tags,
            ['client', 'Swarmstr']
        ];

        event.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Posted!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to publish note' });
                return Promise.resolve();
            })
    };
};