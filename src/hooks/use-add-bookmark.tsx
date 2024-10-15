import {NDKRelaySet, NDKList} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools/lib/types/core";

import {useUserBookmarks} from "./use-user-bookmarks";
import {useSigning} from "../providers/SigningProvider";
import {useRelays} from "../providers/RelaysProvider";
import {useNDK} from "../providers/NDKProvider";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useAddBookmark = (event: NostrEvent) => {
    const {user} = useSigning();
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();
    const {setSnackbarMessage} = useSnackbar();
    const {list} = useUserBookmarks(user?.pubkey || '');

    return async (relayUrls?: string[]) => {
        if (!(list instanceof NDKList)) return Promise.resolve();
        console.log('useAddBookmark bookmarking', {event,list,user})

        await list?.addItem(['e', event.id]);
        list?.publish(NDKRelaySet.fromRelayUrls(relayUrls ?? writeRelays, ndk))
            .then(() => {
                setSnackbarMessage({ type: 'success', message: 'Bookmarked!' });
                return Promise.resolve();
            })
            .catch((e: any) => {
                setSnackbarMessage({ type: 'error', message: 'Unable to bookmark event' });
                return Promise.resolve();
            })
    };
};