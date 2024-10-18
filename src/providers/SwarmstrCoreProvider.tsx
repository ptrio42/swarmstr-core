import React from "react";
import { DialogProvider } from "./DialogProvider";
import { NDKProvider } from "./NDKProvider";
import { RelaysProvider } from "./RelaysProvider";
import { SigningProvider } from "./SigningProvider";
import { SnackbarProvider } from "./SnackbarProvider";
import { SubscriptionManagerProvider } from "./SubscriptionManagerProvider";
import {MuteListProvider} from "./MuteListProvider";
import { RelayInformationProvider } from "./RelayInformationProvider";
import {CustomEmojisProvider} from "./CustomEmojisProvider";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addDefaultLocale(en);

const SwarmstrCoreProvider = ({ children }: { children: any }) => {
    return <React.Fragment>
        {/*<Routes>*/}
            <DialogProvider>
                <SnackbarProvider>
                    <NDKProvider>
                        <SubscriptionManagerProvider>
                            <SigningProvider>
                                <RelaysProvider>
                                    <RelayInformationProvider>
                                        <MuteListProvider>
                                            <CustomEmojisProvider>
                                                {children}
                                            </CustomEmojisProvider>
                                        </MuteListProvider>
                                    </RelayInformationProvider>
                                </RelaysProvider>
                            </SigningProvider>
                        </SubscriptionManagerProvider>
                    </NDKProvider>
                </SnackbarProvider>
            </DialogProvider>
        {/*</Routes>*/}
    </React.Fragment>
};

export default SwarmstrCoreProvider;