import { useEffect, useState } from 'react';
import Egg from './Egg.jsx';
import PixelGrid from './PixelGrid.jsx';
import biomes from '../../../shared/data/biomes.json';
import './Hatch.css';

const CREATURE_ROWS = [
    '..00....00..',
    '.obbo..obbo.',
    '.obbbbbbbbo.',
    'obbbbbbbbbbo',
    'obbobbbbobbo',
    'obbobbbbobbo',
    'obbbbaabbbbo',
    'obllbbbbllbo',
    '.obbbbbbbbo.',
    '..oo....oo..',
];

export default function Hatch({ tier, creature, duplicate }) {
    const [phase, setPhase] = useState('shake');

    useEffect(() => {
        const crack = setTimeout(() => setPhase('crack'), 1500);
        const reveal = setTimeout(() => setPhase('reveal'), 2100);
        return () => {
            clearTimeout(crack);
            clearTimeout(reveal);
        };
    }, []);

    if (phase !== 'reveal') {
        return (
            <div className="hatch">
                <div className={`hatch-egg ${phase}`}>
                    <Egg tier={tier} scale={8} />
                </div>
                <p>IT IS HATCHING...</p>
            </div>
        );
    }

    return (
        <div className="hatch">
            <div className="hatch-creature">
                <PixelGrid
                rows={CREATURE_ROWS}
                palette={biomes.tiers[creature.tier].colors}
                scale={8}
                />
            </div>
            <p>
                IT HATCHED A{' '}
                <span classNAme={`tier-${creature.tier}`}>
                    {biomes.tiers[creature.tier].label} {creature.name.toUpperCase()}
                </span>
            </p>
            {duplicate && <p>YOU ALREADY HATCHED THIS ONE.</p>}
        </div>
    );
}