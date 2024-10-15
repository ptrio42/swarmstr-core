import {nip19, NostrEvent} from "nostr-tools";
import {uniq, uniqBy} from "lodash";
import {Star, StarHalf, StarOutline} from "@mui/icons-material";
import React from "react";
import {NDKTag, NDKEvent, NDKList} from "@nostr-dev-kit/ndk";
import {tagValuesFromEvent} from "../../helpers/nostr/event";
import {request} from "../request";

export const getPubkeyFromNpub = (npub: string) => {
    try {
        return nip19.decode(npub)?.data;
    } catch (e) {
        console.error('getPubkeyFromNpub: string is not an npub...');
        return undefined;
    }
};

export const getFlatUserRelays = (relayList: any): string[] => {
    return uniq(Object.values(relayList).flat(2)) as string[];
};

export const getIconFromRating = (rating: number) => {
    switch (true) {
        case rating <= 50 && rating > 25: {
            return <StarHalf/>;
        }
        case rating > 50: {
            return <Star/>;
        }
        default: {
            return <StarOutline/>;
        }
    }
};

//@ts-ignore
export const getRatingLabelAsIcon = (event: NostrEvent) => {
    //@ts-ignore
    const lTags = event.tags.filter((tag: NDKTag) => tag[0] === 'l' && tag[2] === 'note');
    if (lTags && lTags.length > 0) {
        const rating = lTags.map((tag: NDKTag) => JSON.parse(tag[3])?.quality).reduce((prev: number, curr: number) => +prev + curr, 0);
        const rounded = Math.round((rating + Number.EPSILON) * 100);
        return getIconFromRating(rounded);
    }
};

export const listSetsDTagsFromListEvent = (event: NostrEvent): string[]|undefined => {
    return tagValuesFromEvent(event, 'a')?.map((value: string) => value.split(':')[2]) ?? undefined;
};

export const customEmojisFromTags = (events: NostrEvent[]) => {
    return events
        .map(event => event.tags
            .filter((tag: NDKTag) => tag[0] === 'emoji')
            .map((tag: NDKTag) => ({
                id: `:${tag[1]}:`,
                names: [tag[1].replace('_', ' ')],
                imgUrl: tag[2]
            })))
        .flat(2);
};

export const customReactionTagFromEmoji = (emoji: any) => {
    if (!emoji.isCustom) return undefined;
    const emojiId = emoji.emoji.replace(/:/g, '');
    return ['emoji', emojiId, emoji.imageUrl];
};

export const tagValueArrayFromTags = (tags: NDKTag[], searchTag: string) => {
    return tags.filter(tag => tag[0] === searchTag).map(tag => tag[1])
};

export const eventSecurityFilter = (event: NDKEvent|NostrEvent, muteTags: NDKTag[]) => {
    const pubkeys = tagValueArrayFromTags(muteTags, 'p');
    const words = tagValueArrayFromTags(muteTags, 'word');
    const passed = !pubkeys.includes(event.pubkey) &&
        (words
            .map(word => !event.content.includes(word))
            .reduce((prev, curr) => prev && curr, true));
    console.log(`eventSecurityFilter event ${event.content} ${passed ? 'passsed' : 'did not pass'} security filter criteria`)
    return passed;
};

export const eventListEventsFilter = (event: NostrEvent, depth: number, parentId?: string, grandparentId?: string) => {
    if (depth === -1) return true;
    const eTags = tagValueArrayFromTags(event.tags, 'e');
    return eTags.length === depth ||
        (parentId && eTags.length === 1 && eTags[0] === parentId) ||
        (parentId && grandparentId && eTags.length === 2 && eTags.includes(parentId) && eTags.includes(grandparentId));
};

export const tagsFromNoteContent = (content: string, isReply?: boolean) => {
    const eTags: NDKTag[] = [
        ...(content.match(/nostr:note1([a-z0-9]+)/gm) || []),
        ...(content.match(/nostr:nevent1([a-z0-9]+)/gm) || [])
    ]?.filter((e) => !!e)
        .map((match: string) => nip19.decode(match.split(':')[1]))
        // @ts-ignore
        .map(({data}) => ['e', data?.id || data]);

    const pTags: NDKTag[] = [
        ...(content.match(/nostr:npub1([a-z0-9]+)/gm) || []),
        ...(content.match(/nostr:nprofile1([a-z0-9]+)/gm) || [])
    ]?.filter((e) => !!e)
        .map((match: string) => nip19.decode(match.split(':')[1]))
        // @ts-ignore
        .map(({data}) => ['p', data?.pubkey || data]);

    const qTags: NDKTag[] = [];
    if (eTags.length > 0 && !isReply) {
        for (let i = 0; i < eTags.length; i++) {
            qTags.push(['q', eTags[i][1]]);
        }
    }

    const tTags = content.match(/\B(\#[a-zA-Z0-9]+\b)(?!;)/gm)
        ?.map((match: string) => ['t', match.replace('#', '')]);

    return uniqBy(
        [
            ...(eTags || []),
            ...(pTags || []),
            ...(tTags || []),
            ...(qTags || [])
        ].filter((t) => !!t && t.length > 0)
        , (tag: NDKTag) => tag.join());
};

export const getUserDisplayedName = (metadata: any) => {
    return metadata?.name || metadata?.displayName || metadata?.nip05;
};

export const formatNpub = (npub: string) => {
    return npub.slice(5, 13) + ':' + npub.slice(npub.length - 8);
};

export const getEventsStats = async (eventIds: string[]) => {
    const stats: any = await Promise.all(
        // @ts-ignore
        chunk(eventIds, 10).map((_ids: string[]) => request({
            url: `https://api.nostr.band/v0/stats/event/batch?objects=${_ids.join(',')}`,
            method: 'GET'
        }))
    );
    const arr = stats.map(({data: { stats }}: any) => Object.values(stats)).flat(2);
    console.log('nostr/helpers: getEventsStats: ', {stats: arr});
    return arr;
};