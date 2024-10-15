import {TimeAgo} from "../TimeAgo/TimeAgo";
import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {EventSkeleton} from "../EventSkeleton/EventSkeleton";
import {Typography} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import {Metadata} from "../Metadata/Metadata";
import Box from "@mui/material/Box";
import {Link} from '../Link';
import {containsTag, valueFromTag} from "../../utils/utils";
import {Config} from "../../resources/Config";
import {nip19, NostrEvent} from "nostr-tools";
import {noteContentToHtml} from "../../services/note2html";
import "./NoteContent.css";
import {getZapper, zapAmountFromEvent} from "../../services/nostr/zap";
import {getReaction} from "../../services/nostr/reaction";
import {Image} from "../Image/Image";
import {useThread} from "../../providers/ThreadProvider";
import {useEventCache} from "../../providers/EventCacheProvider";

interface NoteContentProps {
    event: NostrEvent;
    expanded?: boolean;
    floating?: boolean;
    nevent?: string;
    searchString?: string;
    props: any;
    showFullText?: boolean;
}

const MetadataMemo = React.memo(Metadata);

const NoteContent = ({ event, expanded, floating, searchString, showFullText }: NoteContentProps) => {

    const {deletion} = useThread();
    const eventCache = useEventCache();

    const [parsedContent, setParsedContent] = useState<any>();

    const determineWhereToSliceText = useCallback((text: string) => {
        let defaultSliceIndex = 300;
        const [charsAllowedToSliceAt] = [' ', ',', '.', '?', '!'];

        while (
            defaultSliceIndex < text.length &&
            !charsAllowedToSliceAt.includes(text.charAt(defaultSliceIndex))
        ) {
            defaultSliceIndex++;
        }
        return defaultSliceIndex;
    }, []);

    const { id } = event;
    const nevent = useMemo(() => id && nip19.neventEncode({ id, relays: ['wss://q.swarmstr.com'] }), [id]);

    const isDeleted = useMemo(() => deletion?.pubkey === event.pubkey, [event, deletion]);

    useEffect(() => {
        if (!!event?.content) {
            let _parsedContent: any;
            if (isDeleted) {
                _parsedContent = '🚫 This event was deleted by it\'s author.';
            } else {
                let content = event!.content;
                const sliceIndex = determineWhereToSliceText(content);
                if (!expanded && !showFullText && content.length > 300) content = content.slice(0, sliceIndex) + '...';
                const referencedEventId = valueFromTag(event, 'e');
                if (referencedEventId &&
                    containsTag(event!.tags, ['t', Config.HASHTAG]) &&
                    !(new RegExp(/nostr:note1([a-z0-9]+)/gmi).test(event.content) ||
                        new RegExp(/nostr:nevent1([a-z0-9]+)/gmi).test(event.content))) {
                    const bech32Id = nip19.noteEncode(referencedEventId);
                    content = `${content}\nnostr:${bech32Id}`;
                }
                // @ts-ignore
                _parsedContent = noteContentToHtml(content, event!.tags, searchString, floating);
            }
            setParsedContent(_parsedContent);
        }
    }, [event, showFullText, expanded, nevent, id, deletion]);

    if (!event) {
        return <EventSkeleton visible={true} />
    }

    const getTitle = (title?: string) => {
        return title ? <h1>{title}</h1> : '';
    };

    const getImage = (imageUrl?: string) => {
        if (imageUrl) {
            return <img src={imageUrl} width="100%" />
        }
        return;
    };

    return <CardContent sx={{ paddingBottom: 0, padding: 0 /*paddingLeft: '50px'*/ }}>
        { event.kind !== 30009 && <TimeAgo timestamp={event.created_at*1000}/> }
        {
            [1, 30023].includes(event.kind) && <Typography sx={{ display: 'flex', paddingLeft: '3px' }} component="div">
                <MetadataMemo
                    variant="link"
                    pubkey={event.pubkey}
                />
            </Typography>
        }
        <Typography
            sx={{
                '&:hover': { textDecoration: 'none' },
                color: 'unset',
                margin: 0, padding: 0,
                ...(eventCache.getLastItemId() === id && {background: 'rgba(0,0,0,.05)'})
            }}
            gutterBottom
            variant="body2"
            component={expanded ? 'div': Link}
            // onClick={() => navigate(`/e/${nevent}`, {shallow: true})}
            {...(!expanded && { to: `/e/${nevent}` })}
        >
            {/*depth: {depth}*/}
            <Typography
                className="noteContent"
                sx={{
                    ...(!expanded && { cursor: 'pointer' }),
                    ...(!expanded && event.kind === 30009 && {width: 64, height: 64, padding: '0!important'}),
                    ...(isDeleted && { textAlign: 'center!important' })
                }}
                component="div"
            >
                {
                    [1, 30023].includes(event.kind) && <React.Fragment>
                        {/*<QuestionSummary id={id!}/>*/}
                        {
                            getTitle(valueFromTag(event, 'title'))
                        }
                        {
                            getImage(valueFromTag(event, 'image'))
                        }
                        {
                            // @ts-ignore
                            parsedContent
                        }
                    </React.Fragment>
                }
                {
                    [6,7, 8, 9735].includes(event.kind) && <Box sx={{ marginTop: '0.75em' }}>
                        {
                            [6, 7].includes(event.kind) && <React.Fragment>
                                <MetadataMemo
                                    variant="link"
                                    pubkey={event.pubkey}
                                /> { event.kind === 6 ? 'boosted your note.' : <React.Fragment>reacted to your note with { getReaction(event) } </React.Fragment> }
                            </React.Fragment>
                        }
                        {
                            event.kind === 9735 && <React.Fragment>
                                <MetadataMemo
                                    variant="link"
                                    pubkey={getZapper(event)}
                                /> zapped your note { zapAmountFromEvent(event) } sats.
                            </React.Fragment>
                        }
                        {
                            event.kind === 8 && <React.Fragment>
                                <MetadataMemo
                                    variant="link"
                                    pubkey={event.pubkey}
                                /> awarded you a { valueFromTag(event, 'a')?.split(':')[2].replace(/-_/g, ' ') } badge.
                            </React.Fragment>
                        }
                    </Box>
                }
                {
                    [30009].includes(event.kind) && <React.Fragment>
                        {
                            expanded ?
                                <Image url={valueFromTag(event, 'image') as string} /> :
                                <img alt={valueFromTag(event, 'name')} height="64px" src={valueFromTag(event, 'thumb') || valueFromTag(event, 'image')}/>
                        }
                    </React.Fragment>
                }

            </Typography>
        </Typography>

    </CardContent>
};

export default memo(NoteContent);