import {NostrEvent} from "nostr-tools/lib/types/core";
import {NDKEvent} from "@nostr-dev-kit/ndk";

import {last} from "lodash";
import {LRU} from "tiny-lru";

interface EventData {
    id: string;
    height: number;
}

export class EventCache {
    private items: Map<string, EventData> = new Map<string, EventData>();
    private cache: LRU<Map<string, NostrEvent>> = new LRU(21);

    addItem(cacheKey: string, event: NostrEvent, height: number = 0) {
        this.items.set(event.id, {id: event.id, height});
        let map = this.getCache(cacheKey);
        if (!map) {
            map = new Map();
            this.cache.set(cacheKey, map);
        }
        map.set(event.id, event);
    }

    getCache(cacheKey: string) {
        return this.cache.get(cacheKey);
    }

    getItem(id: string) {
        return this.items.get(id);
    }

    getTotalHeight() {
        return Array.from(this.items.values())
            .map(({height}) => height)
            .reduce((previous, current) => previous + current, 0);
    }

    getSize() {
        return this.items.size;
    }

    getLastItemId() {
        return last(Array.from(this.items.keys()));
    }
}