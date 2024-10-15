import {NDKFilter, NDKTag, NDKSubscription, NDKSubscriptionCacheUsage, NDKEvent, NDKRelaySet} from "@nostr-dev-kit/ndk";
import {EventStore} from "./EventStore";
import {NostrEvent} from "nostr-tools";
import {EventEmitter} from "events";
import {eventSecurityFilter} from "../services/nostr/helpers";
import {SubscriptionManager} from "./SubscriptionManager";

export interface EventLoaderOpts {
    castNDKEventsToNostrEvents?: boolean;
    closeOnEose?: boolean;
    groupable?: boolean;
    name?: string;
    throttled?: boolean;
    initialEvents?: NostrEvent[];
}

export class EventLoader<T extends NostrEvent|NDKEvent> extends EventEmitter implements EventLoaderOpts {
    private eoseSeen = false;
    private subManager: SubscriptionManager;

    muteTags: NDKTag[] = [];

    subId?: string;
    filter?: NDKFilter;
    //@ts-ignore
    events: EventStore = new EventStore<T>();

    castNDKEventsToNostrEvents: boolean;
    closeOnEose: boolean;
    groupable: boolean;

    name?: string;
    throttled?: boolean;

    loading: boolean = false;

    private processEvent = (event: NDKEvent) => {
        if (!this.castNDKEventsToNostrEvents) return event;
        return event.rawEvent() as NostrEvent;
    };

    private handleEvent(event: NDKEvent) {
        console.log(`EventLoader: event ${event.id}`, {filter: this.filter, event}, this.events.getEvents());
        if (this.muteTags.length > 0 && !eventSecurityFilter(event, this.muteTags)) return;
        const newEvent = this.processEvent(event);
        this.events.addEvent(newEvent);
        if (this.eoseSeen) this.emit('newEvent', newEvent);
    }

    private handleEose(resolve: (events: NDKEvent[]) => void) {
        console.log(`EventLoader: EOSE seen`, this.filter, this.events.getEvents());
        this.eoseSeen = true;
        resolve(Array.from(this.events.getEvents()));
    }

    private handleClose() {
        console.log(`EventLoader: subscription closed`);
        this.stopLoading();
    }

    private removeMutedEvents = () => {
        if (this.muteTags.length > 0) {
            this.events
                .getEvents()
                .filter((event: T) => !eventSecurityFilter(event, this.muteTags))
                .forEach((event: T) => this.events.removeEvent(event));
        }
    };

    requestEvents = (filter?: NDKFilter, relayUrls?: string[]): Promise<T[]> => {

        if (!filter || this.subId) {
            // @ts-ignore
            if (this.events.getSize() > 0) {
                console.log('EventLoader: cached events', this.events.getEvents());
                this.removeMutedEvents();
                return Promise.resolve(this.events.getEvents());
            }
            return Promise.resolve([]);
        }

        this.filter ??= filter;

        // this.stopLoading();

        //@ts-ignore
        return new Promise<NDKEvent[]>((resolve, reject) => {
            const sub = this.subManager.subscribe(
                filter,
                {
                    closeOnEose: this.closeOnEose,
                    groupable: this.groupable,
                    cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST
                },
                relayUrls
            );
            this.subId = sub?.internalId;
            sub
                //@ts-ignore
                .on('event', (event: NDKEvent) => this.handleEvent(event))
                .on('eose', () => this.handleEose(resolve))
                .on('close', () => this.handleClose());
            this.subManager.addSub(sub);
            this.startLoading(sub.internalId);
        });
    };

    private startLoading(subId: string) {
        console.log(`EventLoader: subManager attempting to start ${this.throttled ? 'throttled ' : ''}subscription`, subId);
        const pending = this.subManager.pending.includes(subId) && this.subManager.getSub(subId);
        if (pending) {
            setTimeout(() => this.startLoading(subId), 50);
            this.throttled ?
                this.subManager.startThrottledSub(subId) :
                this.subManager.startSub(subId);
            return;
        }
        if (!this.subId) this.subId = subId;
        this.loading = true;
    }

    public stopLoading() {
        if (!this.subId || !this.loading) {
            if (this.filter) {
                this.subManager.stopSubByFilter(this.filter);
                this.events.clearEvents();
                this.loading = false;
            }
            return;
        }
        this.subManager.stopSub(this.subId);
        this.events.clearEvents();
        delete this.subId;
        this.loading = false;
    }

    constructor(subManager: SubscriptionManager, opts: EventLoaderOpts = {}) {
        super();
        this.subManager = subManager;
        this.castNDKEventsToNostrEvents = opts.castNDKEventsToNostrEvents ?? true;
        this.closeOnEose = opts.closeOnEose ?? true;
        this.groupable = opts.groupable ?? false;
        this.name ??= opts.name;
        this.throttled = opts.throttled ?? true;
        if (opts.initialEvents) {
            this.events.addEvents(opts.initialEvents);
        }
    }
}