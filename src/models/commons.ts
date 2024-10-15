import {BasicRelayInformation} from "nostr-tools/lib/types/nip11";

export enum EventKind {
    Metadata = 0,
    Note = 1,
    FollowList = 3,
    DeletionRequest = 5,
    Boost = 6,
    Reaction = 7,
    BadgeAward = 8,
    ContentChange = 1010,
    Label = 1985,
    ZapReceipt = 9735,
    MuteList = 10000,
    PinnedNotes = 10001,
    BookmarkList = 10003,
    Emojis = 10030,
    GenericList = 30001,
    BookmarkSet = 30003,
    ProfileBadges = 30008,
    BadgeDefinition = 30009,
    LongForm = 30023,
    EmojiSets = 30030,
    UserStatus = 30315
}

export interface RelayInformation extends BasicRelayInformation {
    url: string;
    icon?: string;
}