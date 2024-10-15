import {NDKEvent} from "@nostr-dev-kit/ndk";
import {NostrEvent} from "nostr-tools";
import {orderBy} from "lodash";

export class EventStore<T extends NostrEvent|NDKEvent> {
    public events: Map<string, T> = new Map<string, T>();
    name?: string;

    getEvents(): T[] {
        console.log('EventStore: events', this.events.values());
        //@ts-ignore
        return orderBy(Array.from(this.events.values()), 'created_at', 'desc');
    };

    public addEvent(event: T) {
        const { id } = event;
        const exists = this.events.get(id);
        if (!exists) {
            this.events.set(id, event);
            console.log('EventStore: adding event: ', {event}, this.events)
        }
    };

    public addEvents(events: T[]) {
        const newEvents = events.reduce((acc, event) => acc.set(event.id, event), new Map());
        this.events = new Map([...this.events, ...newEvents]);
    };

    public clearEvents() {
        this.events.clear();
    }

    public removeEvent(event: T) {
        this.events.delete(event.id);
    }

    public getSize() {
        return this.events.size;
    }

    constructor(name?: string) {
        this.name = name ?? 'n/a';
    }
}