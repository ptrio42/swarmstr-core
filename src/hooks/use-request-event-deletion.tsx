import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKEvent, NDKRelaySet} from "@nostr-dev-kit/ndk";

import {useNDK} from "../providers/NDKProvider";
import {useRelays} from "../providers/RelaysProvider";
import {EventKind} from "../models/commons";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useRequestEventDeletion = (event: NostrEvent) => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();

    const {setSnackbarMessage} = useSnackbar();

    return (content: string = 'event deleted per user request', relayUrls?: string[]): Promise<void> => {
        const {kind, id} = event;
        const newEvent = new NDKEvent(ndk);
        newEvent.kind = EventKind.DeletionRequest;
        newEvent.content = content;
        newEvent.tags = [
            ['e', id!],
            ['k', kind.toString()]
        ];

        return newEvent.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Event deleted!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to request deletion' });
                return Promise.resolve();
            })
    };
};