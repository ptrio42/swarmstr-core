import {NoteLabel, Thumb, thumbsDownTags, thumbsUpTags} from "../dialogs/NewLabelDialog";
import {NostrEvent} from "nostr-tools";
import {NDKRelaySet,NDKEvent} from "@nostr-dev-kit/ndk";
import {useNDK} from "../providers/NDKProvider";
import {useRelays} from "../providers/RelaysProvider";
import {useSnackbar} from "../providers/SnackbarProvider";

export const useAddLabel = () => {
    const ndk = useNDK();
    const {relays:{writeRelays}} = useRelays();
    const {setSnackbarMessage} = useSnackbar();

    return (
        thumb: Thumb,
        label: NoteLabel,
        nostrEvent: NostrEvent,
        pubkey: string,
        content: string,
        additionalLabels?: string[],
        callback?: () => void,
        onError?: (error: any) => void
    ) => {
        try {
            const { reaction, name } = label;
            const event = new NDKEvent(ndk);
            event.kind = 1985;
            event.tags = [];
            event.content = content;
            event.pubkey = pubkey || '';
            event.created_at = Math.ceil(Date.now() / 1000);

            switch (reaction) {
                case 'brain':
                case 'shrug':
                case 'fire':
                case 'eyes':
                case 'triangular_flag_on_post':
                case 'garlic': {
                    event.tags.push(['L', '#e']);
                    event.tags.push(['l', name, '#e']);

                    if (thumb === Thumb.Up) {
                        event.tags.push(...thumbsUpTags(additionalLabels))
                    } else {
                        event.tags.push(...thumbsDownTags());
                    }
                }
                    break;
                case 'hash': {
                    if (content) {
                        const tags = content.match(/\B(\#[a-zA-Z0-9]+\b)(?!;)/g);
                        if (tags && tags.length > 0) {
                            event.tags.push(['L', '#t']);
                            event.tags.push(
                                ...tags!
                                    .map((tag: string) => tag.replace('#', ''))
                                    .map((tag: string) => (['l', tag, '#t']))
                            );
                        }
                    }
                }
                    break;
            }
            const id = nostrEvent?.id;
            if (id) event.tags.push(['e', id]);

            console.log('NostrContextProvider: label: ', {event});

            event.publish(NDKRelaySet.fromRelayUrls(writeRelays, ndk))
                .then(() => {
                    console.log('label event published!');
                    setSnackbarMessage({ message: 'Voted!' });
                    callback && callback();
                })
                .catch((error: any) => {
                    console.error('unable to publish label event...');
                    onError && onError(error);
                    setSnackbarMessage({ message: error.message });
                })

        } catch (error: any) {
            console.error({error});
            onError && onError(error);
            setSnackbarMessage({ message: error.message });
        }
    }
};