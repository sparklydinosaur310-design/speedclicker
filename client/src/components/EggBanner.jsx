import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import biomes from '../../../shared/data/biomes.json';
import './EggBanner.css';

function nameList(names) {
    return `${names.slice(0, -1).join(', ')} AND ${names[names.length - 1]}`;
}

export default function EggBanner({ onGo, hidden }) {
    const [data, setData] = useState(null);
    const [left, setLeft] = useState(0);
    const [dismissed, setDismissed] = useState(null);

    function load() {
        apiFetch('/api/eggs')
        .then((res) => {
            if (res.error || !res.biomes) return;
                const span = biomes.resetMinutes * 60;
                const key = Math.round((Date.now() / 1000 + res.resetsIn) / span);
                setData({ ...res, key});
                setLeft(res.resetsIn);
        })
        .catch(() => {});
    }

    useEffect(() => {
        load();
        const timer = setInterval(load, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!data) return;
        if (left <= 0) {
            load();
            return;
        }
        const timer = setTimeout(() => setLeft((l) => l - 1), 1000);
        return () => clearTimeout(timer);
    }, [left, data]);

    const found = { legendary: [], mythical: [] };
    data?.biomes.forEach((b) => {
        ['legendary', 'mythical'].forEach((tier) => {
            if (b.eggs.some((e) => e.tier === tier)) found[tier].push(b.name.toUpperCase());
        });
    });

    const tier = found.legendary.length ? 'legendary' : found.mythical.length ? 'mythical' : null;
    if (!tier || hidden || dismissed === data.key) return null;

    const places = found[tier];
    const label = biomes.tiers[tier].label;
    const text =
        places.length === 1
        ? `A ${label} EGG HAS SPAWNED IN ${places[0]}!`
        : `${label} EGGS HAVE SPAWNED IN ${nameList(places)}!`;

        return (
            <>
                <div className="egg-banner-space" />
                <div className={`egg-banner ${tier}`}>
                    <button type="button" className="egg-banner-text" onClick={onGo}>
                        {text}
                    </button>
                    <button type="button" className="egg-banner-x" onClick={() => setDismissed(data.key)}>
                        X
                    </button>
                </div>
            </>
        );
}