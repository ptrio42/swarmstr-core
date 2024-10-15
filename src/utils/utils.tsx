import React, {useEffect, useRef, useState} from "react";
import {NostrEvent} from "nostr-tools";
import {NDKEvent, NDKTag} from "@nostr-dev-kit/ndk";
import {request} from "../services/request";
import NDK, {NDKRelay, NDKSubscriptionOptions, NDKFilter} from "@nostr-dev-kit/ndk";
import {getEventsAsPromise} from "../services/nostr/relays";
import {Config} from "../resources/Config";

export const matchString = (searchString: string, phrase: string) => {
  const regEx = new RegExp(searchString.toLowerCase(), 'g');
  return phrase
      .toLowerCase()
      .match(regEx);
};

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

// format amounts
export const nFormatter = (num: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find((item) => {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

// tags contain a specific tag
export const containsTag = (tags: NDKTag[], tag: NDKTag): boolean => {
  return tags && tags.findIndex((t: string[]) => t[0] === tag[0] && t[1] === tag[1]) > -1
};

// tags any of the given tags
export const containsAnyTag = (tags: NDKTag[], tagsToCheck: NDKTag[]): boolean => {
  return tags && tags.some((t: string[]) => tagsToCheck.findIndex((t1: string[]) => t[0] === t1[0] && t[1] === t1[1]))
};

// component is visible on the device
export const noteIsVisible = (ref: any) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
    );

    // @ts-ignore
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

// value from a given tag
//@ts-ignore
export const valueFromTag = (event: NostrEvent|NDKEvent, tag: string): string | undefined => {
  const matchingTag = event.tags.find((t: string[]) => t[0] === tag);

  if (matchingTag) return matchingTag[1];
};

// get keywords from string
export const keywordsFromString = (s: string) => {
  return s.toLowerCase().trim()
      .replace(/([-_']+)/gm, ' ').split(' ')
      .filter((word) => word.length > 1);
};

export const getRelayInformationDocument = async (url: string) => {
  const response = await request({
    url
    //@ts-ignore
  }, { 'Accept': 'application/nostr+json' });
  return response.data;
};

interface useMousePositionProps {
  el?: any;
}

export const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (e: any) => {
      setMousePosition({ x: e.clientX, y: e.clientY});
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

// export const handleNDKEvent = (event: NDKEvent, filter?: NDKFilter) => {
//   console.log(`nostr: Handling NDKEvent ${event.id}:${event.kind}`);
//   try {
//     const nostrEvent = {
//       ...event.rawEvent(),
//       kind: event.kind,
//       ...(filter?.ids?.length === 1 && { id: filter.ids[0] })
//     };
//
//     //handle metadata
//     if (event.kind === 0) db.users.put(event.rawEvent());
//
//     // handle note
//     if (nostrEvent.kind === 1 || nostrEvent.kind === 30023) {
//       const eTags = (nostrEvent.tags && nostrEvent.tags
//           .filter((tag: NDKTag) => tag[0] === 'e'))
//           .map((tag: NDKTag) => tag[1]);
//       console.log('utils: ', {eTags});
//       db.notes.put({
//         ...event.rawEvent(),
//         type: NOTE_TYPE.Note,
//         ...(eTags.length > 0 && {
//           referencedEventId: eTags[0],
//           referencedEventsIds: eTags
//         })
//       });
//     }
//
//     // handle contact list
//     if (event.kind === 3) db.contactLists.put(event.rawEvent());
//
//     // handle list
//     if (event.kind === 30000 || event.kind === 10000 || event.kind === 30001) db.lists.put(event.rawEvent());
//
//     // handle reaction
//     if (nostrEvent.kind === 7) {
//       db.reactions.put({
//         ...nostrEvent,
//         // @ts-ignore
//         reactedToEventId: valueFromTag(nostrEvent, 'e')
//       });
//     }
//
//     // handle repost
//     if (nostrEvent.kind === 6) {
//       db.reposts.put({
//         ...nostrEvent,
//         // @ts-ignore
//         repostedEventId: valueFromTag(nostrEvent, 'e')
//       });
//     }
//     // handle zap
//     if (nostrEvent.kind === 9735) {
//       // console.log('kind 9735', {nostrEvent})
//       db.zaps.put({
//         ...nostrEvent,
//         // @ts-ignore
//         zappedNote: valueFromTag(nostrEvent, 'e'),
//         // @ts-ignore
//         zapper: JSON.parse(valueFromTag(nostrEvent, 'description'))?.pubkey,
//         amount: lightBolt11Decoder.decode(valueFromTag(nostrEvent, 'bolt11')).sections
//             .find((section: any) => section.name === 'amount').value
//       });
//     }
//
//     // handle label
//     if (nostrEvent.kind === 1985) {
//       const label = nostrEvent.tags.find((t: NDKTag) => t[0] === 'l');
//       // console.log('kind 1985 event', {event});
//       db.labels.put({
//         ...nostrEvent,
//         // @ts-ignore
//         referencedEventId: valueFromTag(nostrEvent, 'e'),
//         ...(label && label!.length > 1 && { labelName: label![1] })
//       });
//     }
//   } catch (error) {
//   }
// };

export const useManageSubs = ({ ndk, subscribe }: { ndk: NDK, subscribe: any }) => {
  const subIds = useRef<string[]>([]);

  const unsubscribe = () => {
    ndk.pool.connectedRelays().forEach((relay: NDKRelay) => {
      // relay.activeSubscriptions().forEach((subs: NDKSubscription[]) => {
      //   subs.forEach((sub: NDKSubscription) => {
      //     if (subIds.current.includes(sub.internalId)) {
      //       sub.stop();
      //       console.log(`useManageSubs: Stopping sub ${sub.internalId}`);
      //     }
      //   })
      // })
    });
  };

  const addSub = (
      filter: NDKFilter,
      opts: NDKSubscriptionOptions,
      onEose?: () => void,
      onEvent?: (event: NDKEvent) => void,
      relayUrls?: string[],
      excludedEventsIds?: string[]) => {
    const subId = subscribe(
        ndk,
        filter,
        opts,
        onEose,
        onEvent,
        relayUrls,
        excludedEventsIds
    );
    console.log(`useManageSubs: Adding new sub ${subId}`);
    subIds.current.push(subId);
  };

  const addSubAndReturnAsPromise = async (filter: NDKFilter, relayUrls?: string[]) => getEventsAsPromise(ndk, filter, relayUrls);

  const stopAllSubs = () => {
    if (subIds.current.length === 0) return;
    unsubscribe();
    subIds.current = [];
  };

  return {
    addSub,
    addSubAndReturnAsPromise,
    stopAllSubs
  }
};

const safeDocument = typeof document !== 'undefined' ? document : {};

/**
 * Usage:
 * const [blockScroll, allowScroll] = useScrollBlock();
 */
export const useScrollBlock = () => {
  const scrollBlocked = useRef<boolean>();
  // @ts-ignore
  const html = safeDocument.documentElement;
  // @ts-ignore
  const { body } = safeDocument;

  const blockScroll = () => {
    if (!body || !body.style || scrollBlocked.current) return;

    const scrollBarWidth = window.innerWidth - html.clientWidth;
    const bodyPaddingRight =
        parseInt(window.getComputedStyle(body).getPropertyValue("padding-right")) || 0;

    /**
     * 1. Fixes a bug in iOS and desktop Safari whereby setting
     *    `overflow: hidden` on the html/body does not prevent scrolling.
     * 2. Fixes a bug in desktop Safari where `overflowY` does not prevent
     *    scroll if an `overflow-x` style is also applied to the body.
     */
    html.style.position = 'relative'; /* [1] */
    html.style.overflow = 'hidden'; /* [2] */
    body.style.position = 'relative'; /* [1] */
    body.style.overflow = 'hidden'; /* [2] */
    body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;

    scrollBlocked.current = true;
  };

  const allowScroll = () => {
    if (!body || !body.style || !scrollBlocked.current) return;

    html.style.position = '';
    html.style.overflow = '';
    body.style.position = '';
    body.style.overflow = '';
    body.style.paddingRight = '';

    scrollBlocked.current = false;
  };

  return [blockScroll, allowScroll];
};

export const appNostrTags = Config.NOSTR_TAGS.map((t: string) => ['t', t]);

export const topicalRelays = [
    ['r', 'gm.swarmstr.com'],
    ['r', 'catstrr.swarmstr.com'],
    ['r', 'questions.swarmstr.com'],
    ['r', 'labour.fiatjaf.com'],
    ['r', 'eyes.f7z.io'],
    ['r', 'ppe.swarmstr.com'],
    ['r', '140.f7z.io'],
    ['r', 'yabu.me'],
];