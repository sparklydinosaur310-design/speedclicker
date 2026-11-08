import { useEffect, useState } from 'react';
import Egg from './Egg.jsx';
import Creature from './Creature.jsx';
import biomes from '../../../shared/data/biomes.json';
import './Hatch.css';

export default function Hatch({ tier, creature, duplicate, bonus = 0, onClose }) {
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
            <div className="hatch hatch-full">
                <div className={`hatch-egg ${phase}`}>
                    <Egg tier={tier} scale={12} />
                </div>
                <p>IT IS HATCHING...</p>
            </div>
        );
    }

    return (
        <div className="hatch hatch-full">
            <div className="hatch-creature">
                <Creature id={creature.id} tier={creature.tier} scale={12} />
            </div>
            <p>
                IT HATCHED A{' '}
                <span classNAme={`tier-${creature.tier}`}>
                    {biomes.tiers[creature.tier].label} {creature.name.toUpperCase()}
                </span>
            </p>
            {duplicate && (
                <p>YOU ALREADY HATCHED THIS. +{bonus.toLocaleString()} COINS</p>
            )}
            <button type="button" className="chal-btn" onClick={onClose}>
                CONTINUE
            </button>
        </div>
    );
}