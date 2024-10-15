import React, {memo, useState} from "react";
import {NostrEvent} from 'nostr-tools';

import './Note.css';
import {NoteActions} from "../NoteActions/NoteActions";
import NoteContent from "../NoteContent/NoteContent";
import NoteWrapper from "../NoteWrapper/NoteWrapper";
import {useThread} from "../../providers/ThreadProvider";
import {NoteTags} from "../NoteTags/NoteTags";
import {uniqBy} from "lodash";
import {Config} from "../../resources/Config";

interface NoteProps {
    pinned?: boolean;
    isRead?: boolean;
    nevent?: string;
    context?: 'feed' | 'thread';
    expanded?: boolean;
    event?: NostrEvent
    floating?: boolean;
    state?: {
        events?: NostrEvent[],
        limit?: number
    };
    children?: any;
    searchString?: string;
}

const Note = ({ nevent, context, searchString, pinned, isRead, expanded = false, floating = false, children, ...props }: NoteProps
) => {
    const { event } = useThread();

    const [showFullText, setShowFullText] = useState<boolean>(false);

    if (!event) return;

    return <NoteWrapper id={event?.id} pubkey={event?.pubkey} kind={event?.kind} event={event} expanded={expanded}>
        {/*<NoteScoreBox id={id} event={eventMemo}/>*/}
        <NoteContent
            // nevent={nevent}
            event={event}
            expanded={expanded}
            floating={floating}
            searchString={searchString}
            props={props}
            showFullText={showFullText}
        />
        {/* todo: show note tags in details */}
        {
            expanded && <NoteTags
                styles={{ paddingLeft: '50px', display: 'block' }}
                tags={uniqBy(event?.tags
                    ?.filter((t: string[]) => Config.NOSTR_TAGS.includes(t[1])).map((t: string[]) => [t[0], t[1].toLowerCase()]), (t: string[]) => t[1])}/>

        }
        {
            event.kind !== 30009 && <NoteActions
                event={event}
                showFullText={showFullText}
                handleShowFullText={setShowFullText}
            />
        }
    </NoteWrapper>;
};

export default memo(Note);
