import React from "react";

export const Link = ({ to, children }: { to: string, children: any }) => {
    return <a href={`${process.env.BASE_URL}/${to}`}>
        {children}
    </a>
}