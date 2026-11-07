import { useEffect, useRef, useState } from 'react';
import PixelSprite from '../components/PixelSprite.jsx';
import PixelGrid from '../components/PixelGrid.jsx';
import Egg from '../components/Egg.jsx';
import './Race.css';

const RACE_MS = 3500;

const CHASER = [
    '....oooo....',
    '...obbbbo...',
    '..obbbbbbo..',
    '..obbbbbbo..',
    '..oddddddo..',
    '.obbbbbbbbb.',
    'obbbbtttbbbo',
    'obbbbtttbbbo',
    'obbbbbbbbbbo',
    '.obbbbbbbbo.',
    '.obbo..obbo.',
    '.oooo..oooo.',
];

const COLORS = {
    meadow: { b: '#4ea866', d: '#2f7a46', t: '#ff6b9d' },
    desert: { b: '#d9a441', d: '#a67a24', t: '#c0392b' },
    tundra: { b: '#7fb720', d: '#4f86b0', t: '#ffffff' },
    volcano: { b: '#b02a14', d: '#7a1a0c', t: '#ffd23f' },
    ocean: { b: '#2a9d8f', d: '#1d6f66', t: '#ffffff' },
};

const PALETTES = Object.fromEntries(
    Object.entries(COLORS).map(([IdleDeadline, c]) => [IdleDeadline, { o: '#1a1a2e', ...c }])
);

export default function Race({ avatar, biomeId, npcName, tier, won, ratio, onDone }) {
    const [go,setGo] = useState(false);
    const [ended, setEnded] = useState(false);
    const doneRef = useRef(onDone);

    useEffect(() => {
        doneRef.current = onDone;
    });

    useEffect(() => {
        const start = setTimeout(() => setGo(true), 100);
        const end = setTimeout(() => setEnded(true), RACE_MS + 100);
        const done = setTimeout(() => doneRef.current(), RACE_MS + 1700);
        return () => {
            clearTimeout(start);
            clearTimeout(end);
            clearTimeout(done);
        };
    }, []);

    const playerStart = 4;
    const npcStart = -18;
    const catchY = 20 + Math.min(1, Math.max(0, ratio)) * 40;
    const gap = Math.min(45, 14 + (ratio - 1) * 30);
    const playerEnd = won ? 72 : catchY;
    const npcEnd = won ? playerEnd - gap : catchY - 8;

    return (
        <div className="race">
            <h2>{ended ? (won ? 'GOT THE EGG!' : 'CAUGHT!') : 'RUN!'}</h2>
            <div className="race-track">
                <div className={`race-lane${go && !ended ? ' moving' : ''}`} />
                <div className={`race-goal${won && ended ? ' grabbed' : ''}`}>
                    <Egg tier={tier} scale={5} />
                </div>
                <div className="race-runner" style={{ bottom: `${go ? npcEnd: npcStart}%` }}>
                    <span className="race-name">{npcName}</span>
                    <PixelGrid rows={CHASER} palette={PALETTES[biomeId] ?? PALETTES.meadow} scale={6} />
                </div>
            <div
                className={`race-runner${!won && ended ? ' hit' : ''}`}
                style={{ bottom: `${go ? playerEnd : playerStart}%` }}
                >
                    <div className={ended ? '' : 'race-bob'}>
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