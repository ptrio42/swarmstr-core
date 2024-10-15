import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ElectricBolt} from "@mui/icons-material";
import {ListItemAvatar} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {nip19} from 'nostr-tools';
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import {Link} from "../Link";
import Badge from "@mui/material/Badge";
import {useMetadataEvent} from "../../hooks";
import {formatNpub, getUserDisplayedName} from "../../services/nostr/helpers";

export interface Metadata {
    nip05: string;
    lud06: string;
    lud16: string;
    about: string;
    picture: string;
    pubkey: string;
    name: string;
    displayName: string;
    banner: string;
}

export type MetadataVariantType = 'full' | 'simplified' | 'link' | 'avatar' | 'profile';

interface MetadataProps {
    variant?: MetadataVariantType;
    pubkey: string;
    badge?: any;
    relayUrls?: string[];
}

export const Metadata = ({ pubkey, variant = 'full', badge }: MetadataProps) => {
    if (!pubkey) {
        return <CircularProgress sx={{ width: '18px!important', height: '18px!important' }} />
    }

    const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);

    const {event, requestEvent} = useMetadataEvent(pubkey);

    const npub = pubkey && nip19.npubEncode(pubkey);

    useEffect(() => {
        console.log('Metadata: ', {event})
        requestEvent();
    }, [pubkey]);

    useEffect(() => {
        if (event && event.content) {
            try {
                const content = JSON.parse(event.content);
                console.log('event 0 metadata: ', {content})
                if (!content.banner) content.banner = `${process.env.BASE_URL}/images/background.jpg`;
                setMetadata(content);
            } catch (error) {
                console.error('error parsing metadata content', {error})
            }
        }
    }, [event]);

    const getProfileDisplayedName = useCallback(() => {
        return metadata ? getUserDisplayedName(metadata) : (npub && formatNpub(npub));
    }, [metadata, npub]);

    const avatar = useMemo(() => {
        switch (variant) {
            case 'avatar': {
                return <Tooltip  title={getProfileDisplayedName()}>
                    <Link to={`/p/${npub}`}>
                        <Avatar imgProps={{ height: '30' }} sx={{ width: '30px', height: '30px' }} alt="" src={metadata?.picture} />
                    </Link>
                </Tooltip>
            }
            case 'profile': {
                return <Tooltip  title={getProfileDisplayedName()}>
                    <Avatar imgProps={{ height: '42' }} sx={{ width: '42px', height: '42px' }} alt="" src={metadata?.picture} />
                </Tooltip>
            }
            case 'full': {
                return <Avatar
                    imgProps={{ height: '64' }}
                    sx={{
                        width: '64px',
                        height: '64px',
                        boxShadow: '1px 1px 5px #000'
                    }}
                    alt=""
                    src={metadata && metadata.picture}
                />
            }
            default: {
                return <Avatar imgProps={{ height: '21' }} sx={{ width: '21px', height: '21px' }} alt="" src={metadata && metadata.picture} />

            }
        }
    }, [variant, metadata]);

    return (
        <React.Fragment>
            {
                pubkey && <React.Fragment>
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            ...(variant !== 'avatar' && { width: '100%', }),
                            ...(variant === 'link' && {
                                    transform: 'translateY(5px)',
                                    fontWeight: '400!important',
                                    width: 'auto!important',
                                    display: 'inline-flex'
                            })
                        }}
                        component="div"
                    >
                        <Badge badgeContent={badge} anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}>
                            <ListItemAvatar {...(variant === 'avatar' && { component: Link, to: `/p/${npub}` })} sx={{minWidth: '0', marginRight: '2px'}}>
                                { avatar }
                            </ListItemAvatar>
                        </Badge>
                        {
                            variant !== 'avatar' && <ListItemText
                                primary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{
                                                display: 'flex',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                ...(variant === 'link' && {
                                                    textAlign: 'left'
                                                })
                                            }}
                                        >

                                            <Typography component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Box
                                                    sx={{
                                                        ...(variant === 'full' && { fontSize: '37px', color: '#fff', textShadow: '1px 1px #000000' })
                                                    }}
                                                    {
                                                        ...(variant !== 'full' && { variant: 'text', component: Link, to: `/p/${npub}`})
                                                    }>
                                                    {getProfileDisplayedName()}
                                                </Box>
                                            </Typography>
                                            {
                                                variant !== 'link' &&
                                                <React.Fragment>
                                                    {
                                                        metadata && (metadata.lud06 || metadata.lud16) && <IconButton component={Link} to={`lightning:${metadata.lud06 || metadata.lud16}`}>
                                                            <ElectricBolt sx={{ fontSize: variant === 'full' ? 36: 18 }} />
                                                        </IconButton>
                                                    }

                                                </React.Fragment>
                                            }
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                        }
                    </Typography>
                </React.Fragment>
            }
        </React.Fragment>
    );
};