import React, {useEffect} from "react";

import {EventListWrapper} from "../EventListWrapper/EventListWrapper";
import EventList from "../EventList/EventList";
import EventListProvider from "../../providers/EventListProvider";
import {valueFromTag} from "../../utils/utils";
import {NostrEvent} from "nostr-tools";
import {useProfileBadges, useBadgeAwards, useBadgeDefinitions} from "../../hooks";
import {tagValuesFromEvent} from "../../helpers/nostr/event";
import {EventKind} from "../../models";
import "./BadgeList.css";

//@ts-ignore
const mapBadgeAward = (event: NostrEvent) => event && valueFromTag(event!, 'a').split(':')[2];

export const BadgeList = ({ pubkey }: { pubkey: string }) => {
    const {profileBadges, requestProfileBadges} = useProfileBadges(pubkey);
    const {badgeAwards, requestBadgeAwards} = useBadgeAwards(tagValuesFromEvent(profileBadges, 'e'));
    const {badgeDefinitions, requestBadgeDefinitions} = useBadgeDefinitions(
        badgeAwards
            ?.map(mapBadgeAward)
    );

    useEffect(() => {
        requestBadgeAwards();
    }, [profileBadges]);

    useEffect(() => {
        requestBadgeDefinitions();
    }, [badgeAwards]);

    useEffect(() => {
        console.log('BadgeList: badgeDefinitions', {badgeDefinitions})
    }, [badgeDefinitions]);

    useEffect(() => {
        requestProfileBadges();
    }, []);

    return <EventListProvider events={badgeDefinitions}>
        {/*<EventListSort/>*/}
        <EventListWrapper kinds={[EventKind.BadgeDefinition]}>
            <EventList floating={false} kinds={[EventKind.BadgeDefinition]}/>
        </EventListWrapper>
    </EventListProvider>
};