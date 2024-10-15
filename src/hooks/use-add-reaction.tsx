import NDK, {NDKEvent, NDKRelaySet, NDKTag} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {EventKind} from "../models/commons";
import {useNDK} from "../providers/NDKProvider";
import {useRelays} from "../providers/RelaysProvider";
import {DEFAULT_UP_REACTION} from "./use-event-reactions";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useAddReaction = (event: NostrEvent) => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();

    const {setSnackbarMessage} = useSnackbar();

    return (reaction: string = DEFAULT_UP_REACTION, tags?: NDKTag[], relayUrls?: string[]): Promise<void> => {
        const {pubkey, id} = event;
        const newEvent = new NDKEvent(ndk);
        newEvent.kind = EventKind.Reaction;
        newEvent.content = reaction;
        newEvent.tags = [
            ['e', id!],
            ['p', pubkey]
        ];
        if (tags && tags.length > 0) newEvent.tags.push(...tags);

        return newEvent.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Reacted!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to publish reaction' });
                return Promise.resolve();
            })
    };
};