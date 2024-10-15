import React from "react";
import {NostrEvent} from "nostr-tools";

import {Loop} from "@mui/icons-material";
import {Button} from "@mui/material";

import {useThread} from "../../providers/ThreadProvider";
import {useSigning} from "../../providers/SigningProvider";
import {useAddBoost} from "../../hooks";
import {useDialog} from "../../providers/DialogProvider";

interface BoostButtonProps {
    id?: string;
    event: NostrEvent;
}

export const BoostButton = ({ id, event }: BoostButtonProps) => {

    const { setLoginDialogOpen } = useDialog();
    const boost = useAddBoost(event);
    const {user} = useSigning();

    const {boostCount, boosted} = useThread();

    return <Button
        sx={{
            minWidth: 'unset',
            padding: 0,
            '&:hover': { color: '#3db645' },
            ...(boosted ? {color: '#3db645'} : {color: '#666666' })
        }} onClick={() => {
        // console.log('boost', {event});
        if (user) {
            boost();
        } else {
            setLoginDialogOpen(true);
        }
    }}>
        {/*{*/}
            {/*totalBoosts >= 1 && <React.Fragment>*/}
                {/*<Badge className="reposts-count"*/}
                       {/*sx={{ opacity: boosted() ? 1 : 0.5 }}*/}
                       {/*color="primary"*/}
                       {/*badgeContent={totalBoosts}>*/}
                    <Loop sx={{ fontSize: 27 }} />
        {boostCount}
                {/*</Badge>*/}
            {/*</React.Fragment>*/}
        {/*}*/}
        {/*{*/}
            {/*totalBoosts === 0 && <Loop sx={{ fontSize: 27, opacity: boosted() ? 1 : 0.5 }} />*/}
        {/*}*/}
    </Button>
};