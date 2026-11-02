import { useEffect, useState } from 'react';

export function useGame() {
    const [speed, setSpeed] = useState(0);
    const [perClick, setPerClick] = useState(1);
    const [perSecond, setPerSecond] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setSpeed((s) => s + perSecond / 10);
        }, 100);
        return () => clearInterval(id);
    }, [perSecond]);

    function run() {
        setSpeed((s) => s + perClick);
    }

    return { speed, perClick, perSecond, setPerClick, setPerSecond, run };
}