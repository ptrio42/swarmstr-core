import {ChatBubbleOutline} from "@mui/icons-material";
import React, {memo, useRef} from "react";
import {Button} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {useThread} from "../../providers/ThreadProvider";
import {useSigning} from "../../providers/SigningProvider";
import {useDialog} from "../../providers/DialogProvider";

const ReplyButton = () => {
    const { setLoginDialogOpen, setNewReplyDialogOpen } = useDialog();
    const {user} = useSigning();

    const buttonRef = useRef<any>(null);
    const {repliesCount, replied} = useThread();

    const handleReply = () => {
        if (user) {
            setNewReplyDialogOpen(true);
        } else {
            setLoginDialogOpen(true);
        }
    };

    return <React.Fragment>
        <Tooltip title="Add reply">
            <Button
                ref={buttonRef}
                sx={{
                    textTransform: 'none',
                    padding: 0,
                    minWidth: 'unset',
                    ...(replied ? {color: '#000000'} : {color: '#666666'}),
                    '&:hover': { color: '#000' }
                }}
                onClick={handleReply}
            >
                <ChatBubbleOutline sx={{ fontSize: 27 }} />
                {repliesCount}
            </Button>
        </Tooltip>
    </React.Fragment>
};

export default memo(ReplyButton);