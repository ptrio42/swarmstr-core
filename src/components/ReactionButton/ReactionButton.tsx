import React, {useEffect, useRef, useState} from "react";

import {Button, ClickAwayListener} from "@mui/material";
import {useThread} from "../../providers/ThreadProvider";
import {NostrEvent} from "nostr-tools";
import {FavoriteBorder} from "@mui/icons-material";
import {useAddReaction} from "../../hooks/use-add-reaction";
import {useSigning} from "../../providers/SigningProvider";
import {customReactionTagFromEmoji} from "../../services/nostr/helpers";
import {CustomEmojiPicker} from "../CustomEmojiPicker";
import {useDialog} from "../../providers/DialogProvider";

interface ReactionButtonProps {
    event: NostrEvent;
    icon?: any;
    explicitReactions?: string[][]
}

export const ReactionButton = ({ event, icon, explicitReactions }: ReactionButtonProps) => {

    const { setLoginDialogOpen } = useDialog();

    const {user} = useSigning();

    const {reactionCount, reacted, reactions, requestReactions} = useThread();
    const buttonRef = useRef<any>(null);
    const addReaction = useAddReaction(event);

    const explicitReactionsBucket = !!explicitReactions && reactions
        .filter(({content}) => explicitReactions
            .map((item: string[]) => item[1]).includes(content));

    const [pickerOpen, setPickerOpen] = useState<boolean>(false);

    const handleReaction = () => {
        if (!user) {
            setLoginDialogOpen(true);
        } else {
            setPickerOpen(true);
        }
    };

    const handleEmojiClick = (emoji: any) => {
        console.log('ReactionButton: handleEmojiClick', {emoji});
        const emojiTag = customReactionTagFromEmoji(emoji);
        addReaction(
            emoji.emoji,
            emojiTag ? [emojiTag] : undefined
        ).then(() => {
            setPickerOpen(false);
            requestReactions();
        });
    };

    const handleClickAway = () => {
        setPickerOpen(false);
    };

    useEffect(() => {
        console.log('ReactionButton reactions change', {reactions, reactionCount, reacted})
    }, [reactions, reactionCount, reacted]);

    return <React.Fragment>
        <ClickAwayListener onClickAway={handleClickAway}>
            <CustomEmojiPicker
                open={pickerOpen}
                handleEmojiClick={handleEmojiClick}
                reactions={explicitReactions?.map((item: string[]) => item[0])}
            />
        </ClickAwayListener>
        <Button
            ref={buttonRef}
            sx={{
                padding: 0,
                minWidth: 'unset',
                ...(reacted ? {color: '#9231aa'} : {color: '#666666'}),
                '&:hover': { color: '#9231aa' }
            }}
            onClick={handleReaction}
        >
            { icon ?? <FavoriteBorder sx={{ fontSize: 27 }} /> }
            {
                //@ts-ignore
                explicitReactionsBucket?.length ?? reactionCount
            }
        </Button>
    </React.Fragment>
};