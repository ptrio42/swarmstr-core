import {useCallback, useEffect, useState} from "react";
import {Metadata} from "./Metadata/Metadata";
import {useMetadataEvent} from "../hooks/use-metadata-event";
import {useWindowDimensions} from "../utils/utils";
import React from "react";
import {getUserDisplayedName} from "../services/nostr/helpers";
import {Box} from "@mui/material";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

export const MetadataBanner = ({ pubkey }: { pubkey: string }) => {
    const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);

    const {event, requestEvent} = useMetadataEvent(pubkey);

    const dims = useWindowDimensions();
    const [bannerSize, setBannerSize] = useState<string>('100% 100%');

    const bannerDims = useCallback(() => {
        return bannerSize.split(' ')
            .map((d: string) => +d.replace('px', ''))
    }, [bannerSize]);

    const calculateDimsForHeight = useCallback((height: number, offSet: number, _dims?: number[]) => {
        let [w, h] = _dims || bannerDims();
        if ((h + offSet) > dims.height) {
            w = w * (dims.height - offSet) / h;
            h = dims.height - offSet;

        }
        return {w, h};
    }, [dims]);

    const getBlurWidth = useCallback(() => {
        return `${(dims.width - (+bannerSize.split(' ')[0].replace('px', ''))) /2}px`
    }, [dims]);

    const getImageDimensions = useCallback((imageUrl: string, offSet: number = 222) => {

        let img = new Image();

        img.src = imageUrl;
        img.onload = ({currentTarget}) => {
            let {width, height} = currentTarget as HTMLImageElement;
            console.log('height: '+height);
            console.log('width: '+width);
            const _dims = { w: dims.width, h: dims.width * height/width};
            // leave 222px for user info
            const {w, h} = calculateDimsForHeight(dims.height, offSet, Object.values(_dims));
            setBannerSize(`${w}px ${h}px`);
        }
    }, [dims]);

    const getMarginTop = () => +bannerSize
        .split(' ')[1]
        .replace('px', '') + 77;

    useEffect(() => {
        const banner = metadata?.banner;
        if (banner) getImageDimensions(banner);
    }, [metadata]);

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

    useEffect(() => {
        requestEvent();
    }, []);

    return <Box>
        <Box
            sx={{
                minHeight: '121px',
                width: '100%',
                height: bannerSize.split(' ')[1],
                background: `url(${metadata?.banner})`,
                backgroundSize: bannerSize,
                position: 'fixed',
                top: '69px',
                left: 0,
                backgroundPosition: '50%'
            }}>

        </Box>
        <Box sx={{ width: getBlurWidth(), position: 'absolute', height: '100%', backdropFilter: 'blur(6px)', top: 0, left: 0 }}></Box>
        <Box sx={{ width: getBlurWidth(), position: 'absolute', height: '100%', backdropFilter: 'blur(6px)', top: 0, right: 0 }}></Box>
        <Typography
            sx={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                marginBottom: '1em',
                marginTop: `${getMarginTop()}px`
            }}
            component="div"
        >
            <Avatar
                imgProps={{ height: '64' }}
                sx={{
                    width: '64px',
                    height: '64px',
                    boxShadow: '1px 1px 5px #000'
                }}
                alt=""
                src={metadata && metadata.picture}
            />
            <Typography component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box
                    sx={{
                        fontSize: '37px',
                        color: '#fff',
                        textShadow: '1px 1px #000000'
                    }}>
                    {metadata && getUserDisplayedName(metadata)}
                </Box>
            </Typography>
        </Typography>
        <Typography
            sx={{ display: 'inline', paddingLeft: '3px', background: '#fff' }}
            component="span"
            variant="body2"
            color="text.primary"
        >
            { metadata && metadata.about }
        </Typography>
    </Box>
};