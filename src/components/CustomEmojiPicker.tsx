import React, {useEffect} from "react";
import EmojiPicker from "emoji-picker-react";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {useCustomEmojis} from "../providers/CustomEmojisProvider";

export const CustomEmojiPicker = (
    {
        open,
        reactions,
        handleEmojiClick = () => {}
    }: {
        open?: boolean,
        reactions?: string[],
        handleEmojiClick?: (emoji: any) => void
    }) => {
    const {customEmojis} = useCustomEmojis();

    useEffect(() => {
        console.log('CustomEmojiPicker: custom emojis', {emojis: customEmojis});
    }, [customEmojis]);

    useEffect(() => {
        console.log('CustomEmojiPicker: open', {open});
    }, [open]);

    useEffect(() => {
        console.log('CustomEmojiPicker: reactions', {reactions});
    }, [reactions]);

    return <EmojiPicker
            open={open}
            className={'swarmstr-emojiPicker'}
            onEmojiClick={handleEmojiClick}
            reactionsDefaultOpen={!!reactions}
            allowExpandReactions={!reactions}
            {...reactions && { reactions }}
            {...customEmojis.length > 0 && { customEmojis }}
        />
};