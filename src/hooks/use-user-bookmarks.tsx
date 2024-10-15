import {useCallback, useEffect} from "react";
import {NDKTag, NDKList} from "@nostr-dev-kit/ndk";

import {uniq} from "lodash";

import {useEvents} from "./use-events";
import {useList} from "./use-list";
import {EventKind} from "../models/commons";

export const useUserBookmarks = (pubkey: string) => {
    const {list,requestList} = useList({query:{kind:EventKind.BookmarkList,author:pubkey}});
    const oldBookmarks = useList({query:{kind:EventKind.GenericList,dTags:['bookmark'],author:pubkey}});
    const {events, requestEvents} = useEvents();

    const getBookmarkedItems = useCallback((list: NDKList[]) => {
        if (list?.length > 0) {
            return list[0].items
                .filter((tag: NDKTag) => tag[0] === 'e')
                .map((tag: NDKTag) => tag[1]);
        }
        return [];
    }, [pubkey]);

    useEffect(() => {
        console.log('useUserBookmarks', {list}, oldBookmarks.list);
        const ids: string[] = [];
        ids.push(...getBookmarkedItems(list));
        ids.push(...getBookmarkedItems(oldBookmarks.list));
        console.log('useUserBookmarks', ids);
        requestEvents(uniq(ids));
    }, [list, oldBookmarks.list]);

    useEffect(() => {
        if (pubkey === '') return;
        requestList();
        oldBookmarks.requestList();
    }, [pubkey]);

    return {
        bookmarkedNotes: events,
        list: list[0]
    };
};