import {createContext, useContext, useMemo, useState} from "react";
import {LoginDialog} from "../dialogs/LoginDialog";
import {NewNoteDialog} from "../dialogs/NewNoteDialog";
import {Config} from "../resources/Config";
import {ZapDialog} from "../dialogs/ZapDialog";
import {NewLabelDialog} from "../dialogs/NewLabelDialog";
import React from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";

type DialogContextType = {
    loginDialogOpen?: boolean,
    setLoginDialogOpen: (open: boolean) => void,
    newNoteDialogOpen?: boolean,
    setNewNoteDialogOpen: (open: boolean) => void,
    newLabelDialogOpen?: boolean,
    setNewLabelDialogOpen: (open: boolean) => void,
    zapDialogOpen?: boolean,
    setZapDialogOpen: (open: boolean) => void,
    newReplyDialogOpen?: boolean,
    setNewReplyDialogOpen: (open: boolean) => void,
    imageCreatorDialogOpen?: boolean,
    setImageCreatorDialogOpen: (open: boolean) => void,
    dialogData?: NostrEvent;
    setDialogData: (event: NostrEvent) => void
}

const DialogContext = createContext<DialogContextType>({
    setLoginDialogOpen: () => {},
    setNewLabelDialogOpen: () => {},
    setNewNoteDialogOpen: () => {},
    setNewReplyDialogOpen: () => {},
    setImageCreatorDialogOpen: () => {},
    setZapDialogOpen: () => {},
    setDialogData: () => {}
});

export const DialogProvider = ({ children }: { children: any }) => {
    const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
    const [newNoteDialogOpen, setNewNoteDialogOpen] = useState<boolean>(false);
    const [newLabelDialogOpen, setNewLabelDialogOpen] = useState<boolean>(false);
    const [newReplyDialogOpen, setNewReplyDialogOpen] = useState<boolean>(false);
    const [zapDialogOpen, setZapDialogOpen] = useState<boolean>(false);
    const [imageCreatorDialogOpen, setImageCreatorDialogOpen] = useState<boolean>(false);

    const [dialogData, setDialogData] = useState<NostrEvent>();

    const value = useMemo(() => ({
        loginDialogOpen, setLoginDialogOpen,
        newNoteDialogOpen, setNewNoteDialogOpen,
        newLabelDialogOpen, setNewLabelDialogOpen,
        newReplyDialogOpen, setNewReplyDialogOpen,
        zapDialogOpen, setZapDialogOpen,
        imageCreatorDialogOpen, setImageCreatorDialogOpen,
        dialogData, setDialogData,
    }), []);

    return <DialogContext.Provider value={value}>
        <LoginDialog
            open={loginDialogOpen}
            onClose={() => {
             setLoginDialogOpen(false)
            }}
        />
        <NewNoteDialog
            open={newNoteDialogOpen}
            onClose={() => setNewNoteDialogOpen(false)}
            label="Your note goes here..."
            explicitTags={[['t', Config.HASHTAG]]}
        />
        <ZapDialog
            open={zapDialogOpen}
            event={dialogData}
            onClose={() => setZapDialogOpen(false)}
        />
        <NewNoteDialog
            open={newReplyDialogOpen}
            onClose={() => setNewReplyDialogOpen(false)}
            event={dialogData}
            label="Your reply..."
        />
        <NewLabelDialog
            open={newLabelDialogOpen}
            onClose={() => setNewLabelDialogOpen(false)}
            // selectedLabelName={selectedLabelName}
            reaction={'shaka'}
            event={dialogData}
        />
    </DialogContext.Provider>
};

export const useDialog = () => useContext(DialogContext);