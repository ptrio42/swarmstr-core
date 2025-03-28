import {CopyAll, Delete, Launch, MoreHoriz, PushPin, QrCodeScanner, Share} from "@mui/icons-material";
import React, {useState} from "react";
import {IconButton, MenuItem} from "@mui/material";
import Menu from "@mui/material/Menu";
import {nip19, NostrEvent} from "nostr-tools";
import {useRequestEventDeletion, usePinNote} from "../../hooks";

// TODO: snackbar, new label, show qr

interface EventMenuProps {
    nevent?: string;
    event?: NostrEvent;
}

export const EventMenu = ({nevent, event}: EventMenuProps) => {

    if (!nevent && !event) return;

    if (!nevent) {
        nevent = nip19.neventEncode({id: event!.id!})
    }

    const pinNote = event ? usePinNote(event!) : () => {};
    // const addBookmark = event ? useAddBookmark(event!) : () => {};
    const requestDeletion = event ? useRequestEventDeletion(event!) : () => {};

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleShareLink = (event: React.MouseEvent<HTMLElement>) => {
        // e.stopPropagation();
        navigator.clipboard.writeText(`${process.env.BASE_URL}/e/${nevent}`);
        // setSnackBarMessage('Direct link to answer was copied to clipboard!');
        // setSnackbarOpen(true);
    };

    return <React.Fragment>
        <IconButton
            sx={{ padding: 0, color: '#666666' }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleOpen}
        >
            <MoreHoriz sx={{ fontSize: 27 }} />
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
        >
            <MenuItem onClick={() => {
                navigator.clipboard.writeText(event!.id);
                // setSnackBarMessage(nevent);
                // setSnackbarOpen(true);
                // event.stopPropagation();
            }}>
                <CopyAll sx={{ fontSize: 18, marginRight: 1 }} /> Copy note ID
            </MenuItem>
            <MenuItem onClick={() => {
                event && navigator.clipboard.writeText(JSON.stringify(event));
            }}>
                <CopyAll sx={{ fontSize: 18, marginRight: 1 }} /> Copy note JSON
            </MenuItem>
            <MenuItem onClick={() => pinNote()}>
                <PushPin sx={{ fontSize: 18, marginRight: 1 }}/> Pin
            </MenuItem>
            {/*<MenuItem onClick={() => addBookmark()}>*/}
                {/*<Bookmarks sx={{ fontSize: 18, marginRight: 1 }}/> Bookmark*/}
            {/*</MenuItem>*/}
            <MenuItem onClick={() => requestDeletion()}>
                <Delete sx={{ fontSize: 18, marginRight: 1 }}/> Request Deletion
            </MenuItem>
            <MenuItem
                onClick={(_) => {
                    // setDialogOpen(true);
                }}>
                <QrCodeScanner sx={{ fontSize: 18, marginRight: 1 }} /> Show QR
            </MenuItem>
            <MenuItem onClick={(_) => {
                const a = document.createElement('a');
                a.href = 'nostr:' + nevent;
                a.click();
            }}>
                <Launch sx={{ fontSize: 18, marginRight: 1 }}/> Open in client
            </MenuItem>
            <MenuItem onClick={handleShareLink}>
                <Share sx={{ fontSize: 18, marginRight: 1 }}/> Share link
            </MenuItem>
            {/*<MenuItem*/}
                {/*onClick={() => {*/}
                    {/*// setNewLabelDialogOpen(true)*/}
                {/*}}*/}
            {/*>*/}
                {/*<Label sx={{ fontSize: 18, marginRight: 1 }}/> Label*/}
            {/*</MenuItem>*/}
        </Menu>
    </React.Fragment>
};