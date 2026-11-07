import { useEffect, useMemo, useRef, useState } from 'react';
import PixelSprite from '../components/PixelSprite.jsx';
import PixelGrid from '../components/PixelGrid.jsx';
import './Race.css';

const RACE_MS = 4000;

const NPC_ROWS =[
    '..oooooo..',
    '.obbbbbbo.',
    'obbbbbbbbo',
    'obebbbebbo',
    'obbbbbbbbo',
    'obbbddbbbo',
    '.obbbbbbo.',
    '..oo..oo..',
];

const NPC_COLORS = {
    meadow: { b: '#7bd88f', d: '#4ea866' },
    desert: { b: '#e0b050', d: '#b88a30' },
    tundra: { b: '#9fd8f0', d: '#6fb0d0' },
    volcano: { b: '#ee5a2a', d: '#b03a14' },
    ocean: { b: '#3a8fd0', d: '#2565a0' },
};

export default function Race({ avatar, biomeId, npcName, won, ratio, onDone }) {
    const [go, setGo] = useState(false);
    const doneRef = useRef(onDone);

    useEffect(() => {
        doneRef.current = onDone;
    });

    useEffect(() => {
        const start = setTimeout(() => setGo(true), 100);
        const end = setTimeout(() => doneRef.current(), RACE_MS + 1200);
        return () => {
            clearTimeout(start);
            clearTimeout(end);
        };
    }, []);

    const palette = useMemo(() => {
        const c = NPC_COLORS[biomeId] ?? NPC_COLORS.meadow;
        return { o: '#1a1a2e', b: c.d, d: c.d, e: '#111111' };
    }, [biomeId]);

    const gap = Math.min(40, 8 + (ratio - 1) * 32);
    const playerStart = 12;
    const npcStart = 0;
    const playerEnd = won? 84: 50;
    const npcEnd = won
        ? playerEnd - gap
        : playerEnd + 6 + Math.min(14, (1 - ratio) * 20);

    return (
        <div className="race">
            <h2>RUN!</h2>
            <div className="race-track">
                <div className="race-finish" />
                <div className="race-ground" />
                <div className="race-runner" style={{ left: `${go ? npcEnd : npcStart}%`}}>
                    <span className="race-name">{npcName}</span>
                    <div className="race-bob">
                        <PixelGrid rows={NPC_ROWS} palette={palette} scale={6} />
                    </div>
                </div>
                <div className="race-runner" style={{ left: `${go ? playerEnd : playerStart}%`}}>
                    <div className="race-bob">
                        <PixelSprite avatar={avatar} scale={5} />
                    </div>
                </div>
            </div>
            <button type="button" className="chal-btn" onClick={() => doneRef.current()}>
                SKIP
            </button>
        </div>
    );
}