import Note from "../Note/Note";
import React, {useCallback, useMemo} from "react";
import {ListItem, SelectChangeEvent} from "@mui/material";
import List from "@mui/material/List";
import { NostrEvent } from 'nostr-tools';
import Button from "@mui/material/Button";
import {ArrowBack} from "@mui/icons-material";
import ThreadProvider, {useThread} from "../../providers/ThreadProvider";
import {valueFromTag} from "../../utils/utils";
import Typography from "@mui/material/Typography";
import './Thread.css';
import {Config} from "../../resources/Config";
import {EventListWrapper} from "../EventListWrapper/EventListWrapper";
import EventList, {Sort} from "../EventList/EventList";
import EventListProvider from "../../providers/EventListProvider";
import {TagSelect} from "../TagSelect/TagSelect";
import {EventListSort} from "../EventListSort/EventListSort";
import {getEventTree} from "../../helpers/nostr/event";
import {NoteForm} from "../NoteForm";

interface ThreadProps {
    nevent?: string;
    children?: any;
    expanded?: boolean;
    render?: boolean;

    data?: {
        noteId?: string
        events?: any[];
        event?: any;
    }
    floating?: boolean;
    state?: {
        events?: NostrEvent[]
    };
    depth?: number;
    showReplies?: boolean;
    navigate?: (path: string|-1) => void
}

const NoteThread = ({
                        data = {},
                        children, expanded,
                        floating, showReplies = false,
                        navigate = () => {}
}: ThreadProps) => {
    const { id, nevent, event, depth, replies } = useThread();

    const tree = useMemo(() => event ? getEventTree(event!) : [], [id, event]);

    const commentEvents = useMemo(() => replies
        .filter(({tags}: NostrEvent) => !tags.includes(['q', id]))
        , [replies]);

    const goBack = useCallback(() => {
        navigate(-1);
    }, []);

    return (
        <React.Fragment>
            <List sx={{ padding: 0, ...(event && event!.kind === 30009 && { margin: '0 4px' }) }} id={`note-thread-${id}`}>

                {
                    expanded && <ListItem key={'nostr-resources-nav-back'} sx={{ justifyContent: 'space-between' }}>
                        <Button sx={{ textTransform: 'capitalize', fontSize: '16px', borderRadius: '18px' }} color="secondary" variant="outlined" onClick={() =>
                            // @ts-ignore
                            goBack()
                        }>
                            <ArrowBack sx={{ fontSize: 18, marginRight: 1 }} />
                            Back
                        </Button>
                        <TagSelect
                            tags={Config.NOSTR_TAGS}
                            onTagSelect={(event: SelectChangeEvent) => {
                                navigate(`/t/${event.target.value as string}`);
                            }}
                        />
                    </ListItem>
                }
                {
                    expanded && tree && tree.map((eventId: string, i: number) => <ListItem className="replyParent">
                        <ThreadProvider id={eventId}>
                            <NoteThread
                                key={`${eventId}-thread`}
                                floating={false}
                                depth={i}
                            >
                                <Note key={`${eventId}-content`} floating={false}/>
                            </NoteThread>
                        </ThreadProvider>
                    </ListItem>)
                }
                <ListItem
                    key={`${id}-container`}
                    className={expanded ? 'rootNote-container' : ''}
                    sx={{
                        padding: 0,
                        ...(expanded && tree && tree.length > 0 && { width: `${100 - depth * 10}%!important`, margin: 'auto' })
                    }}>
                    {children}
                </ListItem>
                {
                    (expanded || !expanded && showReplies) && <List key={`${nevent}-answers`} sx={{ width: '90%', margin: 'auto', padding: '0!important' }}>
                        { !commentEvents && <Typography
                            className="thread-repliesPlaceholder"
                            component="div"
                            variant="body1"
                        >
                            Loading notes...
                        </Typography>
                        }
                        { (commentEvents && commentEvents.length === 0 && !showReplies) && <Typography
                            className="thread-repliesPlaceholder"
                            component="div"
                            variant="body1"
                        >
                            No replies yet...
                        </Typography>
                        }


                        <EventListProvider limit={10}>
                            { expanded && commentEvents.length > 0 && <EventListSort/> }
                            <EventListWrapper>
                                <EventList
                                    expanded={showReplies}
                                    parentId={id}
                                    grandparentId={event && valueFromTag(event!, 'e')}
                                    depth={((tree.length > 0 ? tree.length : depth) + 1)}
                                    events={commentEvents}
                                />
                            </EventListWrapper>
                        </EventListProvider>
                    </List>
                }
                {
                    expanded && <NoteForm replyToEvent={event} />
                }
            </List>
        </React.Fragment>
    );
};

export default React.memo(NoteThread);