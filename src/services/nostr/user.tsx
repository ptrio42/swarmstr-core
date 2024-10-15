import {groupBy} from 'lodash';
import {NostrEvent} from "nostr-tools/lib/types/core";

import {DEFAULT_USER_RELAYS} from "./relays";

const formatRelayUrl = (relay: any) => {
    const {url} = relay;
    return `${url}${url[url.length - 1] !== '/' ? '/' : ''}`;
};

export const getUserRelays = (contactList: NostrEvent) => {
    try {
        const relayList = JSON.parse(contactList.content);
        let relays: any = groupBy(Object.keys(relayList)
            .map((url: string) => ([
                {
                    url,
                    permission: {
                        key: 'read',
                        value: relayList[url]?.read
                    },
                },
                {
                    url,
                    permission: {
                        key: 'write',
                        value: relayList[url]?.write
                    },
                }
            ]))
            .flat(2)
            .filter((relay: any) => relay.permission.value), 'permission.key');
        const { read, write } = relays;
        relays = {
            readRelays: read.map(formatRelayUrl),
            writeRelays: write.map(formatRelayUrl)
        };
        return relays;
    } catch (error) {
        return DEFAULT_USER_RELAYS;
    }
};