import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import Creature from '../components/Creature.jsx';
import biomes from '../../../shared/data/biomes.json';
import './Collection.css';

export default function Collection() {
    const [owned, setOwned] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        apiFetch('/api/collection')
        .then((res) => {
            if (res.error) return setError(res.error);
            setOwned(new Set(res.owned));
        })
        .catch(() => setError('Could not load your collection'));
    }, []);

    return (
        <div className="collection">
            <h1>COLLECTION</h1>
            {error && <p className="col-error">{error}</p>}
            {!owned && !error && <p>LOADING...</p>}
            {owned &&
            biomes.biomes.map((b) => {
                const have = b.creatures.filter((c) => owned.has(c.id)).length;
                return (
                    <section key={b.id} className="col-biome">
                        <div className="col-head">
                            <strong>{b.name}</strong>
                            <span>{have} / {b.creatures.length}</span>
                        </div>
                        <div className="col-grid">
                            {b.creatures.map((c) => {
                                const got = owned.has(c.id);
                                return (
                                    <div key={c.id} className={`col-card${got ? '' : ' locked'}`}>
                                        <Creature id={c.id} tier={c.tier} scale={5} silhouette={!got} />
                                        <span className="col-name">{got ? c.name : '???'}</span>
                                        <span className={`col-tier tier-${c.tier}`}>
                                            {biomes.tiers[c.tier].label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}