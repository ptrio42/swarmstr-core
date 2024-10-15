import React, {useEffect} from "react";
import {useUserStatus} from "../../hooks/use-user-status";
import {Box} from "@mui/material";

export const UserStatus = ({ pubkey }: { pubkey: string }) => {
    const {status, requestStatus} = useUserStatus(pubkey);

    useEffect(() => {
        requestStatus();
        console.log('UserStatus: requesting status')
    }, []);

    return <Box>{ status }</Box>
};