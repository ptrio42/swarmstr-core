import {KeyboardArrowDown, KeyboardArrowUp} from "@mui/icons-material";
import React from "react";
import {Box} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {NostrEvent} from "nostr-tools";
import {useSigning} from "../../providers/SigningProvider";
import {useDialog} from "../../providers/DialogProvider";

interface NoteScoreBoxProps {
    id: string;
    event?: NostrEvent;
}

export const NoteScoreBox = ({ id, event }: NoteScoreBoxProps) => {

    const {setLoginDialogOpen,setNewLabelDialogOpen} = useDialog();
    const {user} = useSigning();

    const score = 0;

    const quality = undefined;

    if (!event) {
        return null;
    }

    return <Box
        className="noteScore"
        sx={{
            width: '48px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            position: 'absolute',
            height: '100%',
            flexDirection: 'column',
            paddingTop: '12px'
        }}
    >
        <IconButton onClick={() => {
            if (user) {
                setNewLabelDialogOpen(true);
            } else {
                setLoginDialogOpen(true);
            }
        }}>
            <Tooltip title={"Thumbs up"}>
                <KeyboardArrowUp/>
            </Tooltip>
        </IconButton>
        { score }
        <IconButton onClick={() => {
            if (user) {
                setNewLabelDialogOpen(true);
            } else {
                setLoginDialogOpen(true);
            }
        }}>
            <Tooltip title={"Thumbs down"}>
                <KeyboardArrowDown/>
            </Tooltip>
        </IconButton>
        {
            quality !== undefined && <Tooltip title="Note rating">
            <div>quality</div>
                {/*<CircularProgressWithLabel sx={{ width: '35px', height: '35px' }} value={quality} color={quality >= 50 ? 'success' : 'error'} />*/}
            </Tooltip>
        }
        {/*<ZapButton event={event}/>*/}
        {/*{*/}
            {/*quality !== undefined && <Badge sx={{ textWrap: 'nowrap', marginTop: '1em' }}color={quality >= 50 ? 'success' : 'error'} badgeContent={`${quality}%`}>*/}
                {/*<Tooltip title="Note rating">*/}
                    {/*<ThumbsUpDownIcon/>*/}
                {/*</Tooltip>*/}
            {/*</Badge>*/}
        {/*}*/}
    </Box>
};