import {NDKFilter} from "@nostr-dev-kit/ndk/dist";

import {EventStore} from "./EventStore";

export class FeedLoader {
    // eventStore: EventStore;
    loading: boolean = false;
    loaded: boolean = false;
    // filter: NDKFilter;
    name: string;

    constructor(name: string) {
        this.name = name;
        // this.eventStore = new EventStore(name);
    }
}