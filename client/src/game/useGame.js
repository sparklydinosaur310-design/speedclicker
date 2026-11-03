import { useEffect, useState } from 'react';
import upgrades from '../../../shared/data/upgrades.json';
import { costOf, ratesFor, spentOn } from './upgrades.js';

export function useGame() {
    const [earned, setEarned] = useState(0);
    const [levels, setLevels] = useState({});
    const { perClick, perSecond } = ratesFor(levels);
    const speed = earned - spentOn(levels);

    useEffect(() => {
        const id = setInterval(() => {
            setEarned((e) => e + perSecond / 10);
        }, 100);
        return () => clearInterval(id);
    }, [perSecond]);

    function run() {
        setEarned((e) => e + perClick);
    }

    function buy(id) {
        const up = upgrades.find((u) => u.id === id);
        if (!up) return;
        if (speed < costOf(up, levels[id] || 0)) return;
        setLevels((l) => ({ ...l, [id]: (l[id] || 0) + 1 }));
    }
    
    function load(save) {
        setEarned(save.earned);
        setLevels(save.levels || {});
    }
    
    return { speed, earned, levels, perClick, perSecond, run, buy, load };
}