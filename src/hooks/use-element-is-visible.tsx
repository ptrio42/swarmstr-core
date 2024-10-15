import {useEffect, useState} from "react";

export const useElementIsVisible = (ref: any) => {
    // if (!ref) return false;
    //
    // const [isIntersecting, setIntersecting] = useState(false);
    //
    // useEffect(() => {
    //     const observer = new IntersectionObserver(([entry]) =>
    //         setIntersecting(entry.isIntersecting)
    //     );
    //
    //     // @ts-ignore
    //     observer.observe(ref.current);
    //     return () => {
    //         observer.disconnect();
    //     };
    // }, [ref]);
    //
    // return isIntersecting;


    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const isVisible = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
                setIsVisible(isVisible);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check on component mount
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return isVisible;
};