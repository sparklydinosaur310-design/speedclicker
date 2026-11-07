import { useEffect, useRef, useState } from 'react';
import PixelSprite from '../components/PixelSprite.jsx';
import PixelGrid from '../components/PixelGrid.jsx';
import './Race.css';

const RACE_MS = 4000;

const NPCS = {
    meadow: {
        rows: [
            '...oo.oo....',
            '..obbobbo...',
            '..obbobbo...',
            '..obbbbbo...',
            '.obbbebbbno.',
            '.obbbbbbbno.',
            '.obbbbbbbbo.',
            '.olllbbbbbo.',
            '.olllbbbbbo.',
            '..obbbbbbbo.',
            '..obo..obo..',
            '..ooo..ooo..',
        ],
        colors: { o: '#1a1a2e', b: '#f2ede4', l: '#ffc2d1', e: '#111111', n: '#ff6b9d' },
    },
    desert: {
        rows: [
            '..00........',
            '.obbo.......',
            '.obbboooo...',
            '.obbbbbbbbo.',
            '..obbbebbbno',
            '..obbbbbbbo.',
            'ooobbbbbbo..',
            'obbobbbbbbo.',
            '.oo.obbbbbo.',
            '....obbbbo..',
            '....obo.obo.',
            '....ooo.ooo.',
        ],
        colors: { o: '#3b2412', b: '#e9a64b', e: '#111111', n: '#111111' },
    },
    tundra: {
        rows: [
            '....oooo....',
            '...obbbbo...',
            '..obbbbbbo..',
            '..obbebbbno.',
            '..obbbbbbo..',
            '.oblllllbo..',
            '.oblllllbo..',
            '.oblllllbo..',
            '.oblllllbo..',
            '..obllllbo..',
            '...nn..nn...',
            '..nnn..nnn..',
        ],
        colors: { o: '#0b1020', b: '#2c4a7c', l:'#ffffff', e: '#ffffff', n: '#ff9f1c' },
    },
    volcano: {
        rows: [
            '.....oo.....',
            '....obbo....',
            '...obbbbo...',
            '..obbaabbo..',
            '..obaaaabbo.',
            '.obbaeaaebbo',
            '.obbaaaaabbo',
            '.obbbaaabbbo',
            '..obbbbbbbo.',
            '..obbbbbbo..',
            '..obo..obo..',
            '..ooo..ooo..',
        ],
        colors: { o: '#3a0a05', b: '#e63e1c', a: '#ffd23f', e: '#111111' },
    },
    ocean: {
        rows: [
            'oo........oo',
            'obo......obo',
            'obbo....obbo',
            '.obbbbbbbbo.',
            '.obebbbbebo.',
            '.obbbbbbbbo.',
            '.obbddddbbo.',
            '..obbbbbbo..',
            '.o.o.oo.o.o.',
            'o..o....o..o',
        ],
        colors: { o: '#1a1a2e', b: '#ee6055', d: '#b03a2e', e: '#ffffff' },
    },
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

    const npc = NPCS[biomeId] ?? NPCS.meadow;

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
                        <PixelGrid rows={npc.rows} palette={npc.colors} scale={6} />
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