import { useRef, useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
    const wakeLock = useRef(null);
    const [isLocked, setIsLocked] = useState(false);

    const requestLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                setIsLocked(true);

                wakeLock.current.addEventListener('release', () => {
                    setIsLocked(false);
                    console.log('Wake Lock released');
                });
                console.log('Wake Lock active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API not supported');
        }
    }, []);

    const releaseLock = useCallback(async () => {
        if (wakeLock.current) {
            try {
                await wakeLock.current.release();
                wakeLock.current = null;
                setIsLocked(false);
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, []);

    // Re-request lock when page visibility changes (e.g. switching tabs)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLock.current !== null && document.visibilityState === 'visible') {
                await requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseLock();
        };
    }, [requestLock, releaseLock]);

    return { isLocked, requestLock, releaseLock };
};
