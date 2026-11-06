import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import Egg from '../components/Egg.jsx';
import biomes from '../../../shared/data/biomes.json';
import './Challenge.css';

export default function Challenge() {
    const [data, setData] = useState(null);
    const [left, setLeft] = useState(0);
    const [error, setError] = useState('');

    function load() {
        apiFetch('/api/eggs')
        .then((res) => {
            if (res.error) return setError(res.error);
            setError('');
            setData(res);
            setLeft(res.resetsIn);
        })
        .catch(() => setError('Could not load eggs'));
    }
    
    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!data) return;
        if (left <= 0) {
            load();
            return;
        }
        const timer = setTimeout(() => setLeft((l) => l - 1), 1000);
        return() => clearTimeout(timer);
    }, [left, data]);

    const mins = Math.floor(left / 60);
    const secs = String(left % 60).padStart(2, '0');

    return (
        <div className="challenge">
            <h1>CHALLENGE</h1>
            {error && <p className="chal-error">{error}</p>}
            {!data && !error && <p>LOADING...</p>}
            {data && (
                <>
                <p className="chal-timer">NEW EGGS IN {mins}:{secs}</p>
                <div className="chal-biomes">
                    {data.biomes.map((b) => (
                        <section key={b.id} className="chal-biome">
                            <div className="chal-head">
                                <strong>{b.name}</strong>
                                <span>{b.npc} · {b.npcSpeed.toLocaleString()} speed</span>
                            </div>
                            <div className="chal-eggs">
                                {b.eggs.map((e) => {
                                    <div key={e.slot} className="chal-egg">
                                        <Egg tier={e.tier} scale={5} />
                                        <span className={`chal-tier tier-${e.tier}`}>
                                            {biomes.tiers[e.tier].label}
                                        </span>
                                     </div>
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}