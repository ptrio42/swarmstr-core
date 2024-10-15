import React, {useEffect, useState} from "react";

import {Box} from "@mui/material";
import {Image} from "./Image/Image";
import Typography from "@mui/material/Typography";

import {request} from "../services/request";

export const LinkPreview = ({url}:{url:string}) => {

    const [preview, setPreview] = useState<any>();

    const getLinkPreview = async (url: string) => {
        const {data} = await request({ url: `${process.env.BASE_URL}/api/preview?url=${url}` });
        return data;
    };

    useEffect(() => {
        getLinkPreview(url)
            .then((data: any) => {
                console.log('LinkPreview', {data});
                setPreview(data);
            })
    }, []);

    return <a href={url}>
        <Box
            sx={{
                border: '1px solid rgba(0,0,0,.05)',
                borderRadius: '16px'
            }}>
            <Image url={preview?.img || `${process.env.BASE_URL}/images/blank-img.png`} />
            <Box sx={{ padding: '4px' }}>
                <Typography sx={{ fontSize: 14 }} component="div" variant="body1">{preview?.domain}</Typography>
                <Typography sx={{ fontSize: 15 }} component="div" variant="body1">{preview?.title}</Typography>
                <Typography sx={{ fontSize: 14 }} component="div" variant="body1">{preview?.description}</Typography>
            </Box>
        </Box>
    </a>
};