import React from "react";
import {NostrEvent} from "nostr-tools";
import {NDKTag} from "@nostr-dev-kit/ndk";

export const getReaction = (event: NostrEvent): any => {
    const { content } = event;
    switch (true) {
        case content === '+':
        case content === '':
            return '💜';
        case /:(?<emoji>[^*]*):/gm.test(event.content): {
            const emojiTag = event.tags.find((tag: NDKTag) => tag[0] === 'emoji');
            if (emojiTag) {
                return <img height="23" src={emojiTag[2]} />
            }
            return '💜';
        }
    }
    return content;
};