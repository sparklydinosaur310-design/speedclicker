import { useEffect, useState } from 'react';
import upgrades from '../../../shared/data/upgrades.json';
import { costOf, ratesFor } from './upgrades.js';

export function useGame() {
    const [speed, setSpeed] = useState(0);
    const [levels, setLevels] = useState({});
    const { perClick, perSecond } = ratesFor(levels);

    useEffect(() => {
        const id = setInterval(() => {
            setSpeed((s) => s + perSecond / 10);
        }, 100);
        return () => clearInterval(id);
    }, [perSecond]);

    function run() {
        setSpeed((s) => s + perClick);
    }

    function buy(id) {
        const up = upgrades.find((u) => u.id === id);
        if (!up) return;
        const cost = costOf(up, levels[id] || 0);
        if (speed < cost) return;
        setSpeed((s) => s - cost);
        setLevels((l) => ({ ...l, [id]: (l[id] || 0) + 1 }));
    }

    return { speed, levels, perClick, perSecond, run, buy };
}