import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import {useFormik} from "formik";
import React, {lazy, useEffect, useRef, useState, Suspense} from "react";
import TextField from "@mui/material/TextField";
import './NewNoteDialog.css';
import {DialogActions, SelectChangeEvent} from "@mui/material";
import Button from "@mui/material/Button";
import {NDKTag} from "@nostr-dev-kit/ndk";
import {nip19, NostrEvent} from 'nostr-tools';
import {differenceWith, uniqBy} from 'lodash';
import {AddReaction, GifBox, Image as ImageIcon} from '@mui/icons-material';
import {uploadToNostrCheckMe, uploadToNostrBuild} from "../services/uploadImage";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {GifDialog} from "./GifDialog";
import {Config} from "../resources/Config";
import {TagChipSelect} from "../components/TagChipSelect/TagChipSelect";
import DialogContent from "@mui/material/DialogContent";
import {LoadingDialog} from "./LoadingDialog";
import {TagSelect} from "../components/TagSelect/TagSelect";
import {useAddNote} from "../hooks/use-add-note";
import {useRelays} from "../providers/RelaysProvider";
import {useSigning} from "../providers/SigningProvider";
import {noteContentToHtml} from "../services/note2html";
import {customReactionTagFromEmoji} from "../services/nostr/helpers";
import {CustomEmojiPicker} from "../components/CustomEmojiPicker";
import {a11yProps, TabPanel} from "../components/TabPanel";
import {useDialog} from "../providers/DialogProvider";

const MDEditor = lazy(() => import('@uiw/react-md-editor'));

enum MediaProvider {
    NostrCheckMe = 'nostrcheck.me', NostrBuild = 'nostr.build'
}

interface NewNoteDialogProps {
    open: boolean;
    onClose?: () => void;
    // replyTo?: string[];
    label?: string;
    explicitTags?: NDKTag[];
    event?: NostrEvent;
}

export const NewNoteDialog = ({ open, onClose, label, event, ...props }: NewNoteDialogProps) => {

    const formik = useFormik({
        // enableReinitialize: true,
        initialValues: {
            content: '',
            title: ''
        },
        onSubmit: (values) => {
            console.log(`form submit`, {values});
        }
    });

    const [tags, setTags] = useState<NDKTag[]>([]);

    // const { setEvent } = useNostrContext();
    const {setLoginDialogOpen} = useDialog();
    const {relays:{writeRelays}} = useRelays();
    const {user} = useSigning();

    const addNote = useAddNote();

    const [emojiTags, setEmojiTags] = useState<NDKTag[]>([]);

    const [pickerOpen, setPickerOpen] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement|null>(null);

    const [kind, setKind] = useState<number>(1);
    const [tabIndex, setTabIndex] = useState<number>(0);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const [gifDialogOpen, setGifDialogOpen] = useState<boolean>(false);


    const [explicitTags, setExplicitTags] = useState<NDKTag[]>(props.explicitTags || []);

    const [imageUrl, setImageUrl] = useState<string>();

    const [content, setContent] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const [mediaProvider, setMediaProvider] = useState<MediaProvider>(MediaProvider.NostrCheckMe);

    const handleFileUpload = (event: any) => {
        const files = (event.currentTarget as HTMLInputElement).files || event.clipboardData.files;
        if (files && files.length > 0) {
            setLoading(true);

            console.log('fileupload media provider', {mediaProvider})
            switch (mediaProvider) {
                case MediaProvider.NostrBuild:
                    uploadToNostrBuild(files[0])
                        .then((url: string) => {
                            console.log('fileupload', 'uploaded', {url});
                            formik.setFieldValue('content', formik.values.content + `\n${url}`);
                            setLoading(false);
                        });
                    return;
                default:
                case MediaProvider.NostrCheckMe:
                    uploadToNostrCheckMe(files![0])
                        .then((url: string) => {
                            console.log('fileupload', 'uploaded', {url});
                            formik.setFieldValue('content', formik.values.content + `\n${url}`);
                            setLoading(false);
                        });
                    return;
            }
        }
    };

    const handleEmojiClick = (emoji: any) => {
        setPickerOpen(false);
        console.log('NewNoteDialog.tsx: emoji', {emoji});
        formik.setFieldValue('content', formik.values.content + `${emoji.emoji}`);
        if (emoji.isCustom) {
            const emojiTag = customReactionTagFromEmoji(emoji);
            if (emojiTag) {
                const emojiId = emojiTag[1];
                console.log('NewNoteDialog emoji id', {emojiId});
                setEmojiTags((previous) => [
                    ...previous
                        .filter((tag: NDKTag) => (tag[0] === 'emoji' && tag[1] !== emojiId)),
                    emojiTag
                ]);
            }
        }
    };

    useEffect(() => {

        const handlePaste = (e: any) => {
            if (fileInputRef.current) {
                fileInputRef.current.files = e.clipboardData.files;
                console.log('NewNoteDialog.tsx', {fileInputRef})
            }
        };
        window.addEventListener('paste', handleFileUpload);
        return () => {
            window.removeEventListener('paste', handleFileUpload);
        };
    }, []);

    useEffect(() => {
        // const diff = replyTo && differenceWith(replyTo.map((pubkey: string) => (['p', pubkey])), tags, (t1, t2) => t1[0] === t2[0] && t1[1] === t2[1]);
        // diff && diff.length > 0 && tags.current.push(...(diff));
    }, [event?.pubkey]);

    useEffect(() => {
        let newKind: number;
        if (tabIndex === 1) {
            newKind = 30023;
        } else {
            newKind = 1;
        }
        setKind(newKind!);
    }, [tabIndex]);

    useEffect(() => {
        // const { content } = formik.values;
        console.log(`content change`, {content}, formik.values.content);
        setContent(formik.values.content);
        if (!formik.values.content) return;

        const eTags: NDKTag[] = [
            ...(content.match(/nostr:note1([a-z0-9]+)/gm) || []),
            ...(content.match(/nostr:nevent1([a-z0-9]+)/gm) || [])
        ]?.filter((e) => !!e)
            .map((match: string) => nip19.decode(match.split(':')[1]))
            // @ts-ignore
            .map(({data}) => ['e', data?.id || data]);

        const qTags: NDKTag[] = [];
        if (eTags.length > 0 && !event) {
            for (let i = 0; i < eTags.length; i++) {
                qTags.push(['q', eTags[i][1]]);
            }
        }

        const tTags = content.match(/\B(\#[a-zA-Z0-9]+\b)(?!;)/gm)
            ?.map((match: string) => ['t', match.replace('#', '')]);
        // console.log({tags: [eTags, tTags, explicitTags]})

        const emojis = content.match(/:(?<emoji>[a-zA-Z0-9_]*):/gmi)?.map((value: string) => value.replace(/:/g, ''));
        console.log('NewNoteDialog: emoji tags', {emojiTags});

        const _tags = uniqBy(
            [
                ...(eTags || []),
                ...(tTags || []),
                ...(explicitTags || []),
                ...(qTags || [])
            ].filter((t) => !!t && t.length > 0)
            , (tag: NDKTag) => tag.join());

        if (event && event.id) {
            _tags.push(['e', event.id]);
            _tags.push(['p', event.pubkey]);
        }

        // @ts-ignore
        setTags([
            ..._tags,
            ...emojiTags.filter((tag: NDKTag) => tag[0] === 'emoji' && emojis?.includes(tag[1]))
        ]);
    }, [formik.values.content, explicitTags, emojiTags]);

    useEffect(() => {
        console.log('NewNoteDialog: tags', {tags});
    }, [tags]);

    useEffect(() => {
        // if (!imageUrl) return;
        // console.log({imageUrl});
        // setTimeout(() => {
        //     formik.setFieldValue('content', formik.values.content + `\n${imageUrl}`, false);
        //     formik.setFieldTouched('content', true, false);
        // }, 1000);
        // setImageUrl(undefined);
    }, [imageUrl]);

    const handleClose = () => {
        // console.log('close');
        onClose && onClose();
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleTagsSelectChange = (event: SelectChangeEvent<any>) => {
        const {
            target: { value }
        } = event;
        console.log({value})
        const newExplicitTags = typeof value === 'string' ? ['t', value] : value.map((t: string) => ['t', t]);
        console.log({newExplicitTags})
        setExplicitTags(newExplicitTags);
        // if (tags.findIndex((t: any) => t[1] === value) > -1) {
        //     console.log(`removing tag ${value}`);
        //     // const newContent = formik.values.content.replace(new RegExp(`\\b#${value}\\b`, 'gm'), '');
        //     // console.log({newContent})
        //
        //     // formik.setFieldValue('content', newContent);
        // } else {
        //     console.log(`adding tag ${value}`)
        //     formik.setFieldValue('content', formik.values.content + ` #${value}`);
        // }


        // const _tags = tags.filter((t: any) => t[1] !== value);
        // if (tags.findIndex((t: any) => t[1] === value) > -1) {
        //     _tags.push(['t', value]);
        // }
        // setTags(_tags);
    };

    const uploadToMediaProvider = (file: any, uploadFn: (file: any) => Promise<any>) => {
        uploadFn(file)
            .then((url: string) => {
                console.log('fileupload', 'uploaded', {url});
                formik.setFieldValue('content', formik.values.content + `\n${url}`);
                setLoading(false);
            });
    };

    return <React.Fragment><Dialog fullWidth={true} fullScreen={fullScreen} open={open} onClose={() => { console.log('close') }}>
            <DialogTitle sx={{ color: 'rgba(255,255,255,.77)', paddingLeft: '8px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleChange} aria-label="Choose note type">
                        <Tab className="newNote-tab" label={event?.id ? 'Short reply' : 'New Note'} {...a11yProps('newNote', 0)} />
                        <Tab className="newNote-tab" label={ event?.id ? 'Create reply' : 'Create Post' } {...a11yProps('newNote',1)} />
                    </Tabs>
                </Box>
            </DialogTitle>
        <DialogContent>
            <Box sx={{ height: '90%' }} className="newNote-form">
                <form onSubmit={formik.handleSubmit}>
                    <TabPanel name={'newNote'} index={0} value={tabIndex}>
                        <TextField
                            sx={{ minWidth: '272px' }}
                            id="content"
                            name="content"
                            label={ label || 'Post' }
                            multiline
                            rows={10}
                            value={content}
                            onChange={(event: any) => {
                                console.log('content event', {event}, formik.values.content)
                                // formik.setFieldValue('content', event.target.value);
                                // setContent(event.target.value);
                                formik.handleChange(event);
                            }}
                            onFocus={() => {
                                setPickerOpen(false);
                            }}
                        />
                        <Box>
                            {
                                //@ts-ignore
                                noteContentToHtml(formik.values.content, tags)
                            }
                        </Box>
                    </TabPanel>
                    <TabPanel name={'newNote'} index={1} value={tabIndex}>
                        <TextField
                            sx={{ marginBottom: '1em', padding: '0!important' }}
                            id="title"
                            name="title"
                            type="text"
                            label="Post title..."
                            value={formik.values.title}
                            onChange={(event) => {
                                formik.handleChange(event);
                            }} />
                        <Suspense fallback={'Loading...'}>
                            <MDEditor
                                value={content}
                                onChange={(value: string | undefined) => {
                                    formik.setFieldValue('content', value);
                                }}
                            />
                        </Suspense>
                    </TabPanel>
                </form>
            </Box>
            <TagChipSelect
                tags={Config.NOSTR_TAGS}
                selectedTags={explicitTags.map((t: NDKTag) => t[1])}
                onTagSelect={handleTagsSelectChange}
            />
        </DialogContent>
            <DialogActions>
                <TagSelect
                    tags={Object.values(MediaProvider)}
                    selectedTag={mediaProvider}
                    onTagSelect={(event: SelectChangeEvent) => {
                        setMediaProvider(event.target.value as MediaProvider);
                    }}
                    label={'Media Provider'}
                    displayHash={false}
                />
                <form>
                    <input
                        style={{ display: 'none' }}
                        id="upload-image"
                        name="upload-image"
                        key="upload-image"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload} />
                        <Button color="warning" onClick={() => {
                            console.log({fileInpuRef: fileInputRef.current})
                            fileInputRef.current?.click();
                        }}>
                            <ImageIcon sx={{ fontSize: 32 }}/>
                        </Button>
                </form>

                <Button color="warning" onClick={() => {
                    setGifDialogOpen(true);
                }}>
                    <GifBox sx={{ fontSize: 32 }}/>
                </Button>
                <Button color="warning" onClick={() => {
                    setPickerOpen(true);
                }}>
                    <AddReaction sx={{ fontSize: 32 }} />
                </Button>
                <Button sx={{ textTransform: 'capitalize', borderRadius: '18px' }} variant="outlined" color="secondary" autoFocus onClick={handleClose}>
                    Cancel
                </Button>
                {
                    user && <Button  sx={{ textTransform: 'capitalize', borderRadius: '18px' }} variant="contained" color="warning" onClick={() => {
                        setLoading(true);
                        addNote(formik.values.content, tags, kind, writeRelays)
                            .then(() => {
                                formik.setFieldValue('content', '');
                                formik.setFieldValue('title', '');
                                // setEvent(undefined);
                                setLoading(false);
                                onClose && onClose();
                            })
                    }} autoFocus>
                        Post
                    </Button>
                }
                {
                    !user && <Button sx={{ textTransform: 'capitalize' }} color="primary" variant="contained" onClick={() => { setLoginDialogOpen(true); }}>
                        Login
                    </Button>
                }
                {/*<ClickAwayListener role="presentation" onClickAway={() => {*/}
                    {/*setEmojiPickerOpen(false);*/}
                    {/*console.log('NewNoteDialog.tsx: emoji picker click away');*/}
                {/*}}>*/}
                    {/*<EmojiPicker*/}
                        {/*open={emojiPickerOpen}*/}
                        {/*className="note-emojiPicker"*/}
                        {/*onEmojiClick={(emoji: any) => {*/}
                        {/*}}*/}
                    {/*/>*/}
                {/*</ClickAwayListener>*/}
                <CustomEmojiPicker
                    open={pickerOpen}
                    handleEmojiClick={handleEmojiClick}
                />
            </DialogActions>
        </Dialog>
        <GifDialog open={gifDialogOpen} onClose={(gifUrl?: string) => {
            if (gifUrl) formik.setFieldValue('content', formik.values.content + `\n${gifUrl}`);
            setGifDialogOpen(false);
        }} />
        <LoadingDialog open={loading}/>
    </React.Fragment>
};