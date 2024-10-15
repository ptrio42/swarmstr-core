import React, {useEffect, useState} from "react";
import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKTag} from "@nostr-dev-kit/ndk";

import {useFormik} from "formik";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import {AddReaction, GifBox, Image as ImageIcon} from "@mui/icons-material";

import {tagsFromNoteContent} from "../services/nostr/helpers";

const LABEL = 'Write a quick reply...';

interface NoteFormProps {
    replyToEvent?: NostrEvent;
    editedEvent?: NostrEvent;
}

export const NoteForm = ({replyToEvent, editedEvent}: NoteFormProps) => {
    const [tags, setTags] = useState<NDKTag[]>([]);

    const formik = useFormik({
        initialValues: {
            content: ''
        },
        onSubmit: (values) => {
            console.log(`form submit`, {values});
        }
    });

    const handleContentChange = (event: any) => {
        setTags(tagsFromNoteContent(event.target.value, !!replyToEvent));
        formik.handleChange(event);
    };

    const handleFileUpload = (event: any) => {}

    useEffect(() => {
        console.log('NoteForm tags', {tags});
    }, [tags]);

    return <Box sx={{ flexDirection: 'column' }}>
        <TextField
            sx={{ width: '100%' }}
            id="content"
            name="content"
            label={ LABEL }
            value={formik.values.content}
            multiline
            rows={5}
            onChange={handleContentChange}
            InputProps={{
                endAdornment: <InputAdornment sx={{ flexDirection: 'column', justifyContent: 'center' }} position="end">
                    <Box sx={{ display: 'flex' }}>
                        <form>
                            <input
                                style={{ display: 'none' }}
                                id="upload-image"
                                name="upload-image"
                                key="upload-image"
                                type="file"
                                // ref={fileInputRef}
                                onChange={handleFileUpload} />
                            <Button sx={{ minWidth: 'unset' }} color="warning" onClick={() => {
                                // console.log({fileInpuRef: fileInputRef.current})
                                // fileInputRef.current?.click();
                            }}>
                                <ImageIcon sx={{ fontSize: 32 }}/>
                            </Button>
                        </form>

                        <Button sx={{ minWidth: 'unset' }} color="warning" onClick={() => {
                            // setGifDialogOpen(true);
                        }}>
                            <GifBox sx={{ fontSize: 32 }}/>
                        </Button>
                        <Button sx={{ minWidth: 'unset' }} color="warning" onClick={() => {
                            // setPickerOpen(true);
                        }}>
                            <AddReaction sx={{ fontSize: 32 }} />
                        </Button>
                    </Box>
                    <Button
                        sx={{
                            textTransform: 'capitalize',
                            borderRadius: '18px'
                        }}
                        variant="contained"
                        color="warning"
                        onClick={() => {
                        }}
                        autoFocus
                    >
                        Add reply
                    </Button>
                </InputAdornment>
            }}
        />
    </Box>
};