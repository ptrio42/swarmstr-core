import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKEvent, NDKRelaySet, NDKTag} from "@nostr-dev-kit/ndk";

import {EventKind} from "../models/commons";
import {useNDK} from "../providers/NDKProvider";
import {useRelays} from "../providers/RelaysProvider";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useEditNote = (event: NostrEvent) => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();
    const {setSnackbarMessage} = useSnackbar();

    return async (content: string, tags: NDKTag[], relayUrls?: string[]) => {
        const event = new NDKEvent(ndk);
        event.kind = EventKind.ContentChange;
        event.content = content;
        event.tags = [
            ...tags,
            ['client', 'Swarmstr']
        ];

        event.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Edited!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to edit note' });
                return Promise.resolve();
            })
    };
};