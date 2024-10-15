import {Dialog, useTheme} from "@mui/material";
import NoteThread from "../components/Thread/Thread";
import Note from "../components/Note/Note";
import ThreadProvider from "../providers/ThreadProvider";
import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

interface ThreadDialogProps {
    open: boolean;
    onClose?: () => void,
    nevent?: string | null
}

export const ThreadDialog = ({ open, onClose, nevent }: ThreadDialogProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Dialog fullWidth={true} fullScreen={fullScreen} open={open} onClose={() => onClose && onClose()}>
            {
                !!nevent && <ThreadProvider nevent={nevent}>
                    <NoteThread
                        key={`${nevent}-thread`}
                        nevent={nevent}
                        expanded={true}
                        floating={true}
                    >
                        <Note key={`${nevent}-content`} nevent={nevent} expanded={true} floating={true}/>
                    </NoteThread>
                </ThreadProvider>
            }
        </Dialog>
    );
};