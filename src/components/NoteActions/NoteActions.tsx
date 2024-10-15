import {NostrEvent} from "nostr-tools";
import ReplyButton from "../ReplyButton/ReplyButton";
import {
    ArrowCircleDown, ArrowCircleUp, DoneOutline,
    ElectricBolt, Favorite, HighlightOff, Insights,
    Loop, Reviews, UnfoldLess, UnfoldMore
} from "@mui/icons-material";
import ZapButton from "../ZapButton/ZapButton";
import {BoostButton} from "../BoostButton/BoostButton";
import {ReactionButton} from "../ReactionButton/ReactionButton";
import {EventMenu} from "../EventMenu/EventMenu";
import React, {useState} from "react";
import {CardActions} from "@mui/material";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {getZapper, zapAmountFromEvent} from "../../services/nostr/zap";
import {getReaction} from "../../services/nostr/reaction";
import {EventEngagements} from "../EventEngagements/EventEngagements";
import {getRatingLabelAsIcon} from "../../services/nostr/helpers";
import {DEFAULT_DOWN_REACTIONS} from "../../hooks/use-event-reactions";
import {EventRelays} from "../EventRelays";
import {useThread} from "../../providers";

interface NoteActionsProps {
    nevent?: string;
    event: NostrEvent;
    pinned?: boolean;
    showFullText?: boolean;
    handleShowFullText?: (value: boolean) => void;
}

export const NoteActions = ({ event, pinned, nevent, showFullText, handleShowFullText = () => {} }: NoteActionsProps) => {
    const {reactions, boosts, zaps, labels, relays} = useThread();
    if (!event && !nevent) {
        return null;
    }

    // const [showFullText, setShowFullText] = useState<boolean>(false);

    const [noteEngagementsVisible, setNoteEngagementsVisible] = useState<boolean>(false);

    return <CardActions sx={{ display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
        <Typography sx={{ width: '100%' }} variant="body2" component="div">
            <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row" spacing={1}>
                <Typography component="div" sx={{ fontSize: 14, display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                    {
                        [1, 30023].includes(event.kind) && event?.content?.length > 300 && <Box>
                            <Button
                                className="showMoreLess-button"
                                color="warning"
                                variant="text"
                                onClick={() => { handleShowFullText(!showFullText) }}>
                                { showFullText ? <React.Fragment><UnfoldLess/>show less</React.Fragment> :
                                    <React.Fragment><UnfoldMore/>show more</React.Fragment> }
                            </Button>
                        </Box>
                    }
                </Typography>
                <Typography component="div" sx={{ fontSize: 14, display: 'flex', justifyContent: 'space-around', alignItems: 'center', minWidth: '270px' }}>
                    {
                        [1, 30023].includes(event.kind) && <React.Fragment>
                            { pinned && <DoneOutline color="success" /> }
                            <ZapButton events={zaps} />
                            <BoostButton id={event!.id!} event={event!}/>
                            <ReplyButton />
                            <ReactionButton
                                event={event}
                                icon={<ArrowCircleUp sx={{ fontSize: '27px!important' }} />}
                            />
                            <ReactionButton
                                event={event}
                                icon={<ArrowCircleDown sx={{ fontSize: '27px!important' }} />}
                                explicitReactions={DEFAULT_DOWN_REACTIONS}
                            />
                            <Button
                                sx={{
                                    minWidth: 'unset',
                                    padding: 0,
                                    color: '#666666',
                                    '&:hover': { color: '#000' }
                                }}
                                onClick={() => {
                                    noteEngagementsVisible ?
                                        setNoteEngagementsVisible(false) :
                                        setNoteEngagementsVisible(true);
                                }}>
                                    {
                                        !noteEngagementsVisible ? <Insights/> : <HighlightOff/>
                                    }
                            </Button>
                        </React.Fragment>
                    }
                    { event.kind !== 30009 && <EventMenu nevent={nevent} event={event}/> }

                </Typography>
            </Stack>
        </Typography>
        {
            noteEngagementsVisible && <Typography sx={{ width: '100%' }} variant="body2" component="div">
                <Stack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 0, paddingBottom: '8px' }} direction="column" spacing={1}>
                    <EventEngagements
                        events={zaps}
                        iconElement={<ElectricBolt sx={{ fontSize: 27, color: '#fba32b' }}/>}
                        customBadgeHandler={zapAmountFromEvent}
                        customPubkeyHandler={getZapper}
                    />

                    <EventEngagements
                        events={boosts}
                        iconElement={<Loop sx={{ fontSize: 27, color: '#3db645' }} />}
                        customBadgeHandler={(_: NostrEvent) => ''}
                    />

                    <EventEngagements
                        events={reactions}
                        iconElement={<Favorite sx={{ color: '#9231aa', fontSize: 27 }} />}
                        //@ts-ignore
                        customBadgeHandler={getReaction}
                    />

                    <EventEngagements
                        //@ts-ignore
                        events={labels}
                        iconElement={<Reviews sx={{ color: '#0272aa', fontSize: 27 }} />}
                        //@ts-ignore
                        customBadgeHandler={getRatingLabelAsIcon}
                    />
                    
                    <EventRelays relaysInfo={relays}/>
                </Stack>
            </Typography>
        }
    </CardActions>
};

// export default React.memo(NoteActions);