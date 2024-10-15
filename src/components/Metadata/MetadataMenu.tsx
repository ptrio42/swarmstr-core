import {CopyAll, Launch, QrCodeScanner} from "@mui/icons-material";
import {nip19} from "nostr-tools";
import React, {memo, useCallback, useEffect, useState} from "react";
import {Menu} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import {MetadataVariantType} from "./Metadata";

const MetadataMenu = ({ pubkey, variant = 'full' }: { pubkey: string, variant?: MetadataVariantType }) => {
    const [npub, setNpub] = useState<string>();
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

    const menuOpen = Boolean(menuAnchorEl);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuAnchorEl(null);
    }, []);

    const handleCopyNpub = useCallback(() => {
        try {
            navigator.clipboard.writeText(npub || '');
        } catch (e) {
            console.error('Unable to copy npub', {e})
        }
    }, [npub]);

    const handleShowQrCode = useCallback(() => {

    }, [npub]);

    const handleOpenInClient = useCallback(() => {
        const a = document.createElement('a');
        a.href = 'nostr:' + npub;
        a.click();
    }, [npub]);

    useEffect(() => {
        try {
            setNpub(nip19.npubEncode(pubkey));
        } catch (e) {
            console.error('Unable to set npub', {e})
        }
    }, [pubkey]);

    return <React.Fragment>
        <IconButton
            aria-controls={menuOpen ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={handleMenuOpen}
        >
            <CopyAll sx={{ fontSize: variant === 'full' ? 36: 18 }} />
        </IconButton>
        <Menu
            anchorEl={menuAnchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
        >
            <MenuItem onClick={handleCopyNpub}>
                <CopyAll sx={{ fontSize: 18, marginRight: 1 }} /> Copy npub
            </MenuItem>
            <MenuItem onClick={handleShowQrCode}>
                <QrCodeScanner sx={{ fontSize: 18, marginRight: 1 }} /> Show QR
            </MenuItem>
            <MenuItem onClick={handleOpenInClient}>
                <Launch sx={{ fontSize: 18, marginRight: 1 }}/> Open in client
            </MenuItem>
        </Menu>
        {/*<QrCodeDialog str={`nostr:${npub}` || ''} dialogOpen={dialogOpen} close={() => setDialogOpen(false)} />*/}
    </React.Fragment>
};

export default memo(MetadataMenu);