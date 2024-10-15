import NDK, {NDKSubscription, NDKFilter, NDKSubscriptionOptions, NDKRelaySet, NDKSubscriptionInternalId} from "@nostr-dev-kit/ndk";
import {throttle} from "lodash";
import {DEFAULT_USER_RELAYS} from "../services/nostr/relays";
import {NDKRelay} from "@nostr-dev-kit/ndk/dist";

enum SubscriptionStatus {
    Pending, Active
}

interface Subscription {
    id: NDKSubscriptionInternalId;
    status: SubscriptionStatus;

}

export class SubscriptionManager {
    // subs: Map<string, NDKSubscription> = new Map<string, NDKSubscription>();
    active: string[] = [];
    pending: string[] = [];

    private ndk: NDK;

    addSub(sub: NDKSubscription) {
        const subId: string = sub.internalId;
        const existingSub = this.getSub(subId);
        if (existingSub && !this.pending.includes(subId)) {
            console.log('SubManager adding sub', {subId, sub});
            this.pending.push(subId);
        }
    }

    startSub = (subId: string) => {
        if (!this.pending.includes(subId) || this.active.includes(subId) || this.active.length === 10) return;

        this.getSub(subId)?.start()
            .then(() => {
                this.pending.splice(this.pending.indexOf(subId), 1);
                this.active.push(subId);
                console.log('SubManager started throttled sub', {subId});
            });
    };

    startThrottledSub = throttle(this.startSub,100);

    subscribe(filter: NDKFilter, opts?: NDKSubscriptionOptions, explicitRelayUrls?: string[]): NDKSubscription {
        const relaySet = NDKRelaySet
            .fromRelayUrls(explicitRelayUrls || DEFAULT_USER_RELAYS.readRelays, this.ndk);

        const props = [];

        // @ts-ignore
        const sub = this.ndk.subscribe(filter,
            opts,
            relaySet,
            false
        );

        if (explicitRelayUrls && explicitRelayUrls.length > 0) {
            const relays = [...relaySet.relays.values()];
            relays
                .forEach((relay: NDKRelay) => {
                    //@ts-ignore
                    relay.subscribe(sub, [filter]);
                    console.log("Subscription Manager: relay", {relay, sub});
                });
        }
        return sub;
    }

    getSub(subId: string) {
        return this.ndk.subManager.subscriptions.get(subId);
    }

    stopSub(subId: string) {
        const sub = this.getSub(subId);
        if (sub) {
            sub.emit('close', sub);
            sub.stop();
        }
        this.active.splice(this.active.indexOf(subId), 1);
        this.pending.splice(this.pending.indexOf(subId), 1);
    }

    stopSubByFilter(filter: NDKFilter) {
        for (const [_, sub] of this.ndk.subManager.subscriptions.entries()) {
            console.log('SubManager sub search', {sub});
            if (sub.filters.some((value: NDKFilter) => JSON.stringify(value) === JSON.stringify(filter))) {
                console.log('SubManager: stop loading: stopping sub', {sub});
                sub.stop();
                this.active.splice(this.active.indexOf(sub.internalId), 1);
                this.pending.splice(this.pending.indexOf(sub.internalId), 1);
            }
        }
    }

    stopAllSubs() {
        for (const [_, sub] of this.ndk.subManager.subscriptions.entries()) {
            sub.stop();
        }
        this.pending = [];
        this.active = [];
    }

    subCount() {
        return this.ndk.subManager.subscriptions.size;
    }

    eventSeenOn(eventId: string): string[] {
        return this.ndk.subManager
            .seenEvents.get(eventId)
            ?.map(({url}: NDKRelay) => url) || [];
    }

    addRelaysToPool(relayUrls: string[]) {
        for (const relayUrl of relayUrls) this.ndk.addExplicitRelay(relayUrl);
    }

    constructor(ndk: NDK) {
        this.ndk = ndk;
    }
}