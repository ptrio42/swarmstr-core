import {nip19} from "nostr-tools";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {EventPointer} from "nostr-tools/lib/types/nip19";
import {valueFromTag} from "../../utils/utils";
import {NostrEvent} from "nostr-tools/lib/types/core";

export const decodeBech32Entity = (bech32String: string): { id: string, kind?: number, pubkey?: string }|undefined => {
    if (!/note|naddr|nevent|npub|nprofile/g.test(bech32String)) return undefined;
    try {
        const { type, data } = nip19.decode(bech32String);
        switch (type) {
            case 'note':
                return { id: data, kind: 1 };
            case 'naddr':
                return {...data, id: data.identifier};
            case 'nevent':
            default:
                return data as EventPointer;
        }
    } catch (e) {}
};

export const getEventTree = (event: NostrEvent) => {
    if (!valueFromTag(event!, 'e')) return [];
    let identifiers: string[] = [];
    try {
        identifiers = event
            .tags
            .filter((tag: NDKTag) => tag[0] === 'e' && !!tag[1])
            .map((tag: NDKTag) => tag[1]);
        console.log('getEventTree: ', {identifiers})
    } catch (error) {
        console.error('Thread: tree: ', {error});
    }
    return identifiers;
};

export const getEventDepthFromETags = (event: NostrEvent) => {
    return event
        .tags
        .filter((tag: NDKTag) => tag[0] === 'e')
        .length - 1;
};

export const tagValuesFromEvent = (event?: NostrEvent, searchTag: string = 'e') => {
    return event && event.tags.filter((tag: NDKTag) => tag[0] === searchTag).map((tag: NDKTag) => tag[1])
};