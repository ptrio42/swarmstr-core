import React, {useEffect, useState} from "react";
import {Box} from "@mui/material";
import './SearchResults.css';
import Snackbar from "@mui/material/Snackbar";
import {NostrEvent} from 'nostr-tools';
import {EventListWrapper} from "../EventListWrapper/EventListWrapper";
import EventListProvider from "../../providers/EventListProvider";
import {NDKFilter} from "@nostr-dev-kit/ndk/dist";

interface SearchResultsProps {
    filter: NDKFilter;
    children?: any;
    resultsCount?: number;
    search?: any;
    results: NostrEvent[];
}

export const SearchResults = ({ children, search, results, filter }: SearchResultsProps) => {
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackBarMessage] = useState<string>('');

    useEffect(() => {
        // eventStore.addEvents(results);
    }, [results]);

    return (
        <React.Fragment>
            <Box
                key="guide-menu"
                className="guide-menu-container"
                sx={{
                    paddingLeft: '0!important',
                    paddingRight: '0!important',
                    justifyContent: 'center',
                    paddingBottom: 0,
                    width: '100%'
                }}
            >
                { search }
            </Box>
            <EventListProvider events={[]}>
                <EventListWrapper>
                    { children }
                </EventListWrapper>
            </EventListProvider>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </React.Fragment>
    );
};