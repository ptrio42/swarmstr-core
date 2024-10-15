import { nip19 } from 'nostr-tools';
import {NDKTag} from "@nostr-dev-kit/ndk";
import parse from "html-react-parser";
import {Metadata} from "../components/Metadata/Metadata";
import NoteThread from "../components/Thread/Thread";
import Note from '../components/Note/Note';
import {LightningInvoice} from "../components/LightningInvoice/LightningInvoice";
import React from "react";
import ReactPlayer from 'react-player';
import { Element, isTag } from 'domhandler';
import {Image} from "../components/Image/Image";
import ThreadProvider from "../providers/ThreadProvider";
import {LinkPreview} from "../components/LinkPreview";

// this method processes notes content, adds html, handles markup, etc.
export const noteContentToHtml = (text: string, tags?: string[][], searchString?: string, floating?: boolean): string => {
    let processedText = text || '';
    processedText = processedText
    // remove any tag from the text that is listed in Config.NOSTR_TAGS
    // .replace(new RegExp(`(?=${tags?.map((t) => `#${t[1]}`).join('|')})`, 'gi'), '')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/nostr:npub1([a-z0-9]+)/gmi, (result) => {
        const npub = result.split(':')[1];
        return `<button class="metadata-btn">${npub}</button>`;
    })
        .replace(/nostr:nprofile1([a-z0-9]+)/gmi, (result) => {
            const nprofile = result.split(':')[1];
            // console.log('note2html: nprofile: ', {nprofile, json: nip19.decode(nprofile)})
            return `<button class="metadata-btn">${nprofile}</button>`;
            // return nprofile;
        })
    .replace(/nostr:note1([a-z0-9]+)/gmi, (result) => {
        const note = result.split(':')[1];
        try {
            //@ts-ignore
            const id = nip19.decode(note).data;
            return `<button class="thread-btn">${id}</button>`;
        } catch (e) {
            return note;
        }
    })
    .replace(/nostr:nevent1([a-z0-9]+)/gmi, (result) => {
        const nevent = result.split(':')[1];
        try {
            //@ts-ignore
            const {id, relays} = nip19.decode(nevent).data;
            return `<button class="thread-btn">${id}</button>`;
        } catch (e) {
            return nevent;
        }
    })
        .replace(/nostr:naddr1([a-z0-9]+)/gmi, (result) => {
            const naddr = result.split(':')[1];
            try {
                //@ts-ignore
                const {id, relays, pubkey} = nip19.decode(naddr).data;
                return `<button class="thread-btn">${id}</button>`;
            } catch (e) {
                return naddr;
            }
        });
    // if (searchString && searchString !== '' && searchString.length > 2) {
    //     const keywords = keywordsFromString(searchString);
    //     const expression = `(${keywords.join('|')})`;
    //     processedText = text
    //         .replace(new RegExp(expression, 'gmi'), '<strong>$1</strong>')
    // }
    processedText = processedText
    // youtube links
    .replace(/https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/g, '<button class="video-btn">$1</button>')
    .replace(/https:\/\/youtube\.com\/watch?v=([a-zA-Z0-9_-]+)/g, '<button class="video-btn">$1</button>')
    // urls but not images and not those used in markdown
    .replace(/(?<!\]\()(https?:\/\/(?![^" \n]*(?:jpg|jpeg|png|gif|svg|webp|mov|mp4))[^" \n\(\)]+)(?<!\))/gm, '<a class="test-0" href="$1" target="_blank">$1</a>')
    // image urls and not those used in markdown
    .replace(/(?<!\]\()(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp)).*(?<!\))/gm, (result) => {
        const multilink = result.split(' ');
        if (multilink.length > 1 ) {
            return multilink
                .filter((str: string) => new RegExp(/http/g).test(str))
                .map((url: string) => new RegExp(/(jpg|jpeg|png|gif|svg|webp)/g).test(url)
                    ? `\n<img class="noteImage" width="100%" src="${url}" style="max-width:512px;" />\n`
                    : `<a class="test" href=${url} target="_blank">${text}</a>`)
                .join('<br/>');
        }
        return `<img class="noteImage" width="100%" src="${result}" style="max-width:512px;" />`
    })
    // image urls in markdown
    .replace(/!(\[(?<text>[^(]+)]\((?<url>[^")]+))\)/gm, (result, _, text, url) => {
        return `<img class="noteImage" src=${url} style="max-width:512px;" alt="${text}" />`;
    })
    // links in markdown
    .replace(/(\[(?<text>[^(]+)]\((?<url>[^")]+))\)/gm, (result, _, text, url) => {
        return `<a class="test" href=${url} target="_blank">${text}</a>`;
    })
    // html comments
    .replace(/(<!--(?<comment>[^-->]*)-->)/gm, '')
    .replace(/\*\*\*(?<boldAndItalic>[^*]*)\*\*\*/gm, '<b><i>$1</i></b>')
    .replace(/(\*\*(?<bold>[^*]*)\*\*)/gm, '<b>$1</b>')
    .replace(/\*(?<italic>[^*]*)\*/gm, '<i>$1</i>')
    .replace(/~~(?<strikethrough>[^~]*)~~/gm, '<s>$1</s>')
    .replace(/`{3}(?<multilineCode>[^§]+?)`{3}/gm, '<pre>$1</pre>')
    .replace(/(^#{1} (?<h1>.+))/gm, (match) => `<h1>${match.slice(2)}</h1>`)
    .replace(/(^#{2} (?<h2>.+))/gm, (match) => `<h2>${match.slice(3)}</h2>`)
    .replace(/(^#{3} (?<h3>.+))/gm, (match) => `<h3>${match.slice(4)}</h3>`)
    .replace(/(^#{4} (?<h4>.+))/gm, (match) => `<h4>${match.slice(5)}</h4>`)
    .replace(/(^#{5} (?<h5>.+))/gm, (match) => `<h5>${match.slice(6)}</h5>`)
    .replace(/(^#{6} (?<h6>.+))/gm, (match) => `<h6>${match.slice(7)}</h6>`)
    .replace(/(?<=^\n)> (?<singleLineQuote>.+)\n(?!^>)/gm, '<blockquote>$1</blockquote>')
    .replace(/(https?:\/\/.*\.(?:mov|mp4))/g, '<button class="video-btn">$1</button>')
    .replace(/\n/g, '<br/>')
    .replace(/lnbc1([a-z0-9]+)/g, '<button class="lnbc-btn">lnbc1$1</button>')
    // @ts-ignore
    .replace(/#\[([0-9]+)\]/g, (placeholder) => {
        const match = placeholder.match(/(\d+)/);
        if (match) {
            const id = match[0];
            const tag = tags && tags[+id];
            if (tag) {
                switch (tag[0]) {
                    case 'p': {
                        return `<button class="metadata-btn">${nip19.npubEncode(tag[1])}</button>`;
                    }
                    case 'e': {
                        return `<a href="${process.env.BASE_URL}/e/${nip19.noteEncode(tag[1])}" target="_blank">@${nip19.noteEncode(tag[1])}</a>`
                    }
                    case 't': {
                        return `<a href="${process.env.BASE_URL}/t/${tag[1].replace(/(<([^>]+)>)/gi, '')}">#${tag[1]}</a>`;
                    }
                }
            }
            // @ts-ignore
            return tags && tags[+id];
        }
    })
    .replace(/(?<!\'\")\B(\#[a-zA-Z0-9\-]+\b)(?!;)(?![\w\s]*[\'\"])/gmi, (result) => {
        const hashtag = result.replace('#', '');
        return `<a href="${process.env.BASE_URL}/t/${hashtag.replace(/(<([^>]+)>)/gi, '')}">#${hashtag}</a>`
    })
    .replace(/(#<a?:.+?:\d{18}>|#\p{Extended_Pictographic})/gu, (result) => {
        const hashtag = result.replace('#', '');
        return `<a href="${process.env.BASE_URL}/t/${hashtag.replace(/(<([^>]+)>)/gi, '')}">#${hashtag}</a>`
    })
    //@ts-ignore
    .replace(/:(?<emoji>[a-zA-Z0-9_]*):/gmi, (result) => {
        console.log('note2html found custom emoji', {result, tags})
        const emojiTag = tags?.find((tag: NDKTag) => tag[0] === 'emoji' && tag[1] === result.replace(/:/g, ''));
        if (emojiTag) {
            console.log('note2html found matching emoji tag', {emojiTag})
            return `<img class="customEmoji" src=${emojiTag[2]} />`;
        }
    });
    // @ts-ignore
    return parse(
        processedText,
        {
            //@ts-ignore
            replace: (domNode) => {
                const domElement: Element = domNode as Element;
                if (isTag(domElement)) {
                    // @ts-ignore
                    const { attribs, children, name } = domNode;
                    if (name === 'button' && attribs.class === 'metadata-btn') {
                        const data = children.length > 0 && children[0].data;
                        try {
                            const decodeResult: any = nip19.decode(data)?.data;
                            const userPubkey = decodeResult?.pubkey || decodeResult || data;
                            if (userPubkey) {
                                return  <Metadata
                                    variant={'link'}
                                    pubkey={userPubkey}
                                    relayUrls={decodeResult?.relays}
                                />
                            }
                        } catch (error) {
                            console.error(`unable to decode npub ${data}...`, {error});
                        }
                    }
                    if (name === 'button' && attribs.class === 'thread-btn') {
                        const data = children.length > 0 && children[0].data;
                        return <ThreadProvider id={data}>
                            <NoteThread
                                key={`${data}-thread`}
                                floating={floating}
                            >
                                <Note key={`${data}-content`} floating={floating}/>
                            </NoteThread>
                        </ThreadProvider>
                    }
                    if (name === 'button' && attribs.class === 'video-btn') {
                        let data = children.length > 0 && children[0].data;
                        if (!data.includes('https')) {
                            data = `https://www.youtube.com/watch?v=${data}`
                        }
                        return <ReactPlayer className="video-player" url={data} playing={true} volume={0} muted={true} loop={true} controls={true} />
                    }
                    if (name === 'button' && attribs.class === 'lnbc-btn') {
                        const data = children.length > 0 && children[0].data;
                        if (data) {
                            return <LightningInvoice lnbc={data}/>
                        }
                    }

                    if (name === 'img' && attribs.class === 'noteImage') {
                        return <Image url={attribs.src} />
                    }

                    if (name === 'img' && attribs.class === 'customEmoji') {
                        return <img height="23" src={attribs.src} />
                    }
                    
                    if (name === 'a' && attribs.class === 'test-0') {
                        return <LinkPreview url={attribs.href}/>
                    }
                }
            }
        }
    );
};