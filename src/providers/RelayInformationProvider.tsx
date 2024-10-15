import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useRelays} from "./RelaysProvider";
import {request} from "../services/request";
import {RelayInformation} from "../models/commons";
import {BasicRelayInformation} from "nostr-tools/lib/types/nip11";
import {BackgroundSets, generateAvatar} from "robohash-avatars";

const RelaysInformationContext = createContext<RelayInformation[]>([]);

export const RelayInformationProvider = ({children}:{children:any}) => {
    const {relays:{readRelays}} = useRelays();

    const [relaysInformation, setRelaysInformation] = useState<RelayInformation[]>([]);

    const requestRelaysInformation = useCallback(() => {
        const relaysInfo: RelayInformation[] = [];
        readRelays
            .forEach((url: string) => {
                request({
                    url: url.replace('wss', 'https'),
                    method: 'GET'
                    //@ts-ignore
                }, {
                    'Accept': 'application/nostr+json'
                }).then((response:{data:BasicRelayInformation}) => {
                    console.log('useEventRelays', {response});
                    relaysInfo.push({
                        ...response.data,
                        url,
                        //@ts-ignore
                        icon: response.data.icon ?? generateAvatar({
                            username: response.data.name,
                            background: BackgroundSets.RandomBackground2
                        })
                    });
                });
            });
        return relaysInfo;
    }, [readRelays]);

    useEffect(() => {
        const _relaysInformation = requestRelaysInformation();
        setRelaysInformation(_relaysInformation);
    }, [readRelays]);

    return <RelaysInformationContext.Provider value={relaysInformation}>
        {children}
    </RelaysInformationContext.Provider>
};

export const useRelaysInformation = () => useContext(RelaysInformationContext);