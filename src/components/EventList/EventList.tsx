import {NDKTag} from "@nostr-dev-kit/ndk";
import {nip19, NostrEvent} from "nostr-tools";
import NoteThread from "../Thread/Thread";
import Note from "../Note/Note";
import React, {useMemo} from "react";
import {useEventListProvider} from "../../providers/EventListProvider";
import Box from "@mui/material/Box";
import ThreadProvider from "../../providers/ThreadProvider";
import {EventSkeleton} from "../EventSkeleton/EventSkeleton";
import {EventKind} from "../../models";
import {eventListEventsFilter} from "../../services/nostr/helpers";

export enum Sort {
    MOST_ZAPPED = 'MOST_ZAPPED',
    MOST_ZAPPERS = 'MOST_ZAPPERS',
    MOST_REACTIONS = 'MOST_REACTIONS',
    RECENT = 'RECENT',
    MOST_COMMENTS = 'MOST_COMMENTS'
}

interface EventListProps {
    floating?: boolean;
    depth?: number;
    parentId?: string;
    grandparentId?: string;
    expanded?: boolean;
    showComments?: boolean;
    kinds?: number[];
    events?: NostrEvent[];
}

const EventList = (
    {
        depth = -1,
        parentId,
        grandparentId,
        expanded = false,
        kinds = [EventKind.Note, EventKind.LongForm],
        ...props
    }: EventListProps) => {

    const { limit, sort, ...eventList } = useEventListProvider();

    const events = props.events ?? eventList.events;

    if (!events) {
        return <Box>
            <EventSkeleton visible={!events}/>
        </Box>;
    }

    const filteredEvents =() => {
        console.log('EventList.tsx: filteredEvents', {events});
        const filtered = (events
            ?.filter(({kind}: NostrEvent) => kinds.includes(kind))
            ?.filter((event: NostrEvent) => eventListEventsFilter(event, depth, parentId, grandparentId))
            .slice(0, limit) || [])
            .filter(({id}: NostrEvent) => !!id)
            .filter((event: NostrEvent) => !parentId || (parentId &&
                event.tags.findIndex((tag: NDKTag) => tag[0] === 'q' && tag[1] === parentId) === -1));
        console.log('EventList.tsx: filteredEvents', {filtered});

        return filtered;
    };

    const noteThread = useMemo(() => (event: NostrEvent) => <ThreadProvider
        id={event.id}
        event={event}
    >
        <NoteThread
            // state={{events}}
            // expanded={expanded}
            showReplies={expanded}
            depth={depth+1}
        >
                <Note/>
        </NoteThread>
    </ThreadProvider>, [events, limit, depth, sort]);

    return <React.Fragment>
        {
            filteredEvents()
                .map((event: NostrEvent) => noteThread(event))
        }
    </React.Fragment>
};

export default EventList;