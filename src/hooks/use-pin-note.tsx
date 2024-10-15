import NDK, {NDKEvent, NDKRelaySet} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {useNDK} from "../providers/NDKProvider";
import {useRelays} from "../providers/RelaysProvider";
import {EventKind} from "../models/commons";
import {useSnackbar} from "../providers/SnackbarProvider";

export const usePinNote = (event: NostrEvent) => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();

    const {setSnackbarMessage} = useSnackbar();

    return (relayUrls?: string[]) => {
        const {pubkey, id} = event;
        const newEvent = new NDKEvent(ndk);
        newEvent.kind = EventKind.PinnedNotes;
        newEvent.content = '';
        newEvent.tags = [
            ['e', id!],
            ['p', pubkey]
        ];

        newEvent.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Pinned!' });
            })
            .catch((e: any) => {
                console.error('usePinNote: pin note error', {e});
                setSnackbarMessage({ type: 'error', message: 'Unable to pin note' });
            })
    };
};