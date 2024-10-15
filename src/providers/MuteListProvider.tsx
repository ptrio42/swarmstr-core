import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {NDKTag, NDKList} from "@nostr-dev-kit/ndk";
import {nip04, NostrEvent} from "nostr-tools";

import {EventKind} from "../models/commons";
import {useSigning} from "./SigningProvider";
import {useList} from "../hooks/use-list";

//@ts-ignore
const MuteListContext = createContext<{muteList?: NDKList, muteTags: NDKTag[]}>({ muteTags: [] });

export const MuteListProvider = ({children}:{children:any}) => {
    const {user} = useSigning();
    const {list, requestList} = useList({
        query: { kind: EventKind.MuteList, author: user?.pubkey }
    });

    const [muteTags, setMuteTags] = useState<NDKTag[]>([]);

    const updateMuteTags = useCallback(() => {
        //@ts-ignore
        if (list?.length > 0) {
            (list[0] as NDKList).encryptedTags()
                .then((tags: NDKTag[]) => {
                    setMuteTags(tags);
                });
        }
    }, [list]);

    useEffect(() => {
        updateMuteTags();
    }, [list]);


    useEffect(() => {
        requestList();
    }, [user?.pubkey]);

    const value = useMemo(() => ({ muteList: list[0], muteTags }), [list, user?.pubkey, muteTags]);

    return <MuteListContext.Provider value={value}>
        {children}
    </MuteListContext.Provider>
};

export const useMuteList = () => useContext(MuteListContext);