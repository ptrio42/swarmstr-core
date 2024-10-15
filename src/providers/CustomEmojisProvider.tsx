import {useSigning} from "./SigningProvider";
import {useList} from "../hooks/use-list";
import {EventKind} from "../models/commons";
import {customEmojisFromTags, listSetsDTagsFromListEvent} from "../services/nostr/helpers";
import React, {createContext, useContext, useEffect} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

const CustomEmojisContext = createContext<{customEmojis:any[]}>({customEmojis:[]});

export const CustomEmojisProvider = ({children}:{children:any}) => {
    const {user} = useSigning();
    const {list, requestList} = useList({
        query: { kind: EventKind.Emojis, author: user?.pubkey }
    });
    const emojiSets = useList({
        query: { kind: EventKind.EmojiSets, dTags: listSetsDTagsFromListEvent(list[0] as NostrEvent) }
    });
    //@ts-ignore
    const customEmojis = customEmojisFromTags(emojiSets.list);

    useEffect(() => {
        emojiSets.requestList();
    }, [list]);

    useEffect(() => {
        requestList();
    }, [user?.pubkey]);

    return <CustomEmojisContext.Provider value={{ customEmojis }}>
        {children}
    </CustomEmojisContext.Provider>
};

export const useCustomEmojis = () => useContext(CustomEmojisContext);