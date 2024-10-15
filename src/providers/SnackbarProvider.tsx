import {createContext, useContext, useState} from "react";
import React from "react";
import {Snackbar} from "@mui/material";

type SnackbarMessageType = 'error' | 'success';

export interface SnackbarMessage {
    type?: SnackbarMessageType,
    message: string
}

type SnackbarContextType = {
    snackbarMessage?: SnackbarMessage,
    setSnackbarMessage: (message?: SnackbarMessage) => void
}

const SnackbarContext = createContext<SnackbarContextType>({ setSnackbarMessage: () => {} });

export const SnackbarProvider = ({ children }: { children: any }) => {
    const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage|undefined>();

    return <SnackbarContext.Provider value={{
        snackbarMessage, setSnackbarMessage
    }}>
        <Snackbar
            // sx={{ ...(!!snackbarMessage && {backgroundColor: snackbarMessage?.type === 'error' ? '#e40505' : '#5d9f12'}) }}
            open={!!snackbarMessage}
            autoHideDuration={3000}
            onClose={() => setSnackbarMessage(undefined)}
            message={snackbarMessage?.message}
        />
        {children}
    </SnackbarContext.Provider>
};

export const useSnackbar = () => useContext(SnackbarContext);