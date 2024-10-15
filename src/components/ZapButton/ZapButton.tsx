import React, {createContext, memo, useContext} from "react";
import {nip19, NostrEvent} from "nostr-tools";
import {EventPointer} from "nostr-tools/lib/types/nip19";
import {ElectricBolt} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import {useThread} from "../../providers/ThreadProvider";
import {useDialog} from "../../providers/DialogProvider";
import {useSigning} from "../../providers/SigningProvider";

type ZapsDataContextType = {
    zapsTotal?: string;
    zapped?: boolean;
    loading: boolean;
    zapsLength?: number;
    event?: NostrEvent;
}

const ZapsDataContext = createContext<ZapsDataContextType>({
    loading: false
});

interface ZapsDataProviderProps {
    event?: NostrEvent;
    userPubkey?: string | EventPointer;
    children?: any;
    zapEvents?: NostrEvent[];
}

const ZapsDataProvider = ({ event, userPubkey, children }: ZapsDataProviderProps) => {
    const {zapTotal, zapCount, zapped} = useThread();

    // @ts-ignore
    return <ZapsDataContext.Provider value={{ zapsTotal: zapTotal, zapped, zapsLength: zapCount, event }}>
        {children}
    </ZapsDataContext.Provider>
};

export const useZapsDataContext = () => useContext(ZapsDataContext);

interface ZapButtonProps {
    // id: string;
    // event: NostrEvent;

    // eventId: string;
    zapsTotal?: string;
    zapped?: boolean;
    loading?: boolean;
    zapsLength?: number;
    // isLoading?: boolean;

    onZapButtonClick?: () => void;
}

const ZapBtn = ({ zapsTotal, zapsLength = 0, zapped, loading = false, onZapButtonClick = () => {} }: ZapButtonProps) => {

    if (loading) {
        return <CircularProgress sx={{ width: '18px!important', height: '18px!important' }} />;
    }

    return <Tooltip title={`${zapsLength} zaps!`}>
        <Button
            sx={{
                minWidth: 'unset',
                padding: 0,
                ...(zapped ? { color: '#fba32b' } : {color: '#666666'}),
                '&:hover': { color: '#fba32b' }
            }}
            color="secondary"
            onClick={onZapButtonClick}
        >
            <React.Fragment>
                <ElectricBolt sx={{ fontSize: 27 }} />
                { zapsTotal }
            </React.Fragment>
        </Button>
    </Tooltip>
};

const ZapButtonMemo = memo(ZapBtn);

const ZapButtonContainer = () => {
    const {setLoginDialogOpen,setZapDialogOpen} = useDialog();
    const {user} = useSigning();

    const {event, ...zapsDataContext} = useZapsDataContext();

    return <ZapButtonMemo {...zapsDataContext} onZapButtonClick={() => {
        if (user) {
            // setEvent(event);
            setZapDialogOpen(true);
        } else {
            setLoginDialogOpen(true);
        }
    }} />
};

const ZapButton = ({events}: {events: NostrEvent[]}) => {
    const {user} = useSigning();

    return <ZapsDataProvider
        zapEvents={events}
        // @ts-ignore
        userPubkey={user && nip19.decode(user.npub).data}
    >
        <ZapButtonContainer/>
    </ZapsDataProvider>
};

export default memo(ZapButton);
