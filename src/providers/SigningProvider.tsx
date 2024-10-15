import React, {useState, createContext, useContext, useEffect} from "react";
import {NDKUser, NDKNip07Signer} from "@nostr-dev-kit/ndk";

import {useNDK} from "./NDKProvider";

const SigningContext = createContext<{ user?: NDKUser, signIn: () => Promise<void> }>({ signIn: () => Promise.resolve() });

export const SigningProvider = ({ children }: { children: any }) => {
    const ndk = useNDK();
    // const {nostr} = window;

    const [user, setUser] = useState<NDKUser>();

    const signIn = async (): Promise<void> => {
        if (ndk.activeUser) return Promise.resolve();
        const delay = (): Promise<void> => {
            return new Promise((resolve) => setTimeout(resolve, 100, signIn))
        };
        if (window.nostr === undefined) {
            console.log('SigningProvider: window.nostr', window.nostr)
            return await delay();

        }
        try {
            ndk.signer = new NDKNip07Signer();
            return Promise.resolve();
        } catch (e) {
            console.error('SigningProvider: ', {e});
            return await delay();
        }
    };

    const handleSignerRequired = () => {
        console.log('SigningProvider: signer required')
    };
    const handleSignerReady = () => {
        console.log('SigningProvider: signer ready', {user: ndk.activeUser, signer: ndk.signer});
        ndk.signer!.user().then((user?: NDKUser) => {
            console.log('SigningProvider: user', {user});
            ndk.activeUser = user;
            setUser(user);
        })
    };

    useEffect(() => {
        ndk!
            .on('signer:required', () => handleSignerRequired())
            .on('signer:ready', handleSignerReady);
    }, []);

    useEffect(() => {
        console.log('SigningProvider: user changed', {user});
    }, [user]);

    return <SigningContext.Provider value={{ signIn, user }}>
        { children },
    </SigningContext.Provider>
};

export const useSigning = () => useContext(SigningContext);