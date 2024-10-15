import {Box} from "@mui/material";
import React, {useCallback} from "react";

import InfiniteScroll from "react-infinite-scroll-component";

import {useEventListProvider} from "../../providers/EventListProvider";
import './EventListWrapper.css';

interface EventListWrapperProps {
    children?: any;
    onReachedListEnd?: () => void,
    kinds?: number[],
    initialScrollY?: number
}

export const EventListWrapper = ({ children, onReachedListEnd = () => {}, kinds = [1, 30023], initialScrollY }: EventListWrapperProps) => {
    const { events, limit, setLimit } = useEventListProvider();

    // console.log('EventListWrapper', {limit, initialScrollY})

    const onScrollEnd = useCallback(() => {
        setLimit(limit + 1);
        console.log('EventListWrapper: onScrollEnd:', {limit})

        // if (events && events.length <= limit) {
            console.log('reached scroll end', limit);
            onReachedListEnd();
        // }
    }, [limit]);

    return <InfiniteScroll
        dataLength={events!.slice(0, limit).length}
        next={onScrollEnd}
        // initialScrollY={5000}
        hasMore={true}
        loader={<Box sx={{ display: 'none' }}>Loading...</Box>}
        endMessage={
            <p style={{ textAlign: 'center' }}>
                <b>No more results.</b>
            </p>
        }
        className={kinds.includes(30009) ? 'badgeList' : ''}
    >
        { children }
    </InfiniteScroll>
};