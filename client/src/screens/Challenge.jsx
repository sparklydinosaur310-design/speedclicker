import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import Egg from '../components/Egg.jsx';
import biomes from '../../../shared/data/biomes.json';
import './Challenge.css';
import Race from './Race.jsx';
import Hatch from '../components/Hatch.jsx';

function needed(biome, tier) {
    return Math.ceil(biome.npcSpeed * biomes.tiers[tier].multiplier);
}

export default function Challenge({ avatar }) {
    const [data, setData] = useState(null);
    const [left, setLeft] = useState(0);
    const [error, setError] = useState('');
    const [biomeId, setBiomeId] = useState(null);
    const [slot, setSlot] = useState(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);

    function load() {
        apiFetch('/api/eggs')
        .then((res) => {
            if (res.error) return setError(res.error);
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
            setSlot(null);
            load();
            return;
        }
        const timer = setTimeout(() => setLeft((l) => l - 1), 1000);
        return () => clearTimeout(timer);
    }, [left, data]);

    const biome = data?.biomes.find((b) => b.id === biomeId )
    const mins = Math.floor(left / 60);
    const secs = String(left % 60).padStart(2, '0');

    function goBack() {
        setBiomeId(null);
        setSlot(null);
        setResult(null);
        setError('');
    }

    async function challenge() {
        if (slot === null) return;
        const egg = biome.eggs[slot];
        setBusy(true);
        setError('');
        try{
            const res = await apiFetch('/api/challenge', {
                method: 'POST',
                body: JSON.stringify({ biome: biome.id, slot, tier: egg.tier }),
            });
            if (res.error) {
                setError(res.error);
                setSlot(null);
                load();
            } else {
                setResult({ ...res, tier: egg.tier, racing: true });
            }
        } catch {
            setError('Challenge failed');
        }
        setBusy(false);
    }

    return (
        <div className="challenge">
            <h1>CHALLENGE</h1>
            {error && <p className="chal-error">{error}</p>}
            {!data && !error && <p>LOADING...</p>}
            {data && <p className="chal-timer">NEW EGGS IN {mins}:{secs}</p>}

            {data && !biome && (
                <div className="chal-biomes">
                    {data.biomes.map((b) => (
                        <section key={b.id} className="chal-biome click" onClick={() => setBiomeId(b.id)}>
                            <div className="chal-head">
                                <strong>{b.name}</strong>
                                <span>{b.npc} · {b.npcSpeed.toLocaleString()} speed</span>
                            </div>
                            <div className="chal-eggs">
                                {b.eggs.map((e) => (
                                    <div key={e.slot} className="chal-egg">
                                        <Egg tier={e.tier} scale={5} />
                                        <span className={`chal-tier tier-${e.tier}`}>
                                            {biomes.tiers[e.tier].label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {data && biome && !result && (
                <section className="chal-biome">
                    <div className="chal-head">
                        <strong>{biome.name}</strong>
                        <span>{biome.npc} · {biome.npcSpeed.toLocaleString()} speed</span>
                    </div>
                    <p>PICK AN EGG TO STEAL</p>
                    <div className="chal-eggs">
                        {biome.eggs.map((e) => (
                        <button
                        type="button"
                        key={e.slot}
                        className={`chal-egg${slot === e.slot ? ' pick' : ''}`}
                        onClick={() => setSlot(e.slot)}
                        >
                            <Egg tier={e.tier} scale={6} />
                            <span className={`chal-tier tier-${e.tier}`}>
                                {biomes.tiers[e.tier].label}
                            </span>
                            <span className="chal-need">NEEDS {needed(biome, e.tier).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                    <div className="chal-actions">
                        <button type="button" className="chal-btn" onClick={goBack}>BACK</button>
                        <button
                        type="button"
                        className="chal-btn go"
                        disabled={slot === null || busy}
                        onClick={challenge}
                        >
                            CHALLENGE
                        </button>
                    </div>
                </section>
            )}

            {data && biome && result && (
                <Race
                    avatar={avatar}
                    biomeId={biome.id}
                    npcName={biome.npc}
                    tier={result.tier}
                    won={result.won}
                    ratio={result.yours / result.needed}
                    onDone={() => setResult((r) => ({ ...r, racing: false}))}
                    />
            )}

            {data && biome && result && !result.racing && (
                <section className="chal-biome chal-result">
                    {result.won ? (
                        <>
                        <h2>YOU STOLE THE EGG!</h2>
                        <Hatch
                        tier={result.tier}
                        creature={result.creature}
                        duplicate={result.duplicate}
                        />
                        </>
                    ) : (
                        <>
                        <h2>TOO SLOW!</h2>
                        <p>
                            {biome.npc} OUTRAN YOU. YOU NEEDED {result.needed.toLocaleString()} SPEED AND
                            HAVE {Math.floor(result.yours).toLocaleString()}.
                        </p>
                        </>
                    )}
                    <div className="chal-actions">
                        <button type="button" className="chal-btn" onClick={goBack}>BIOMES</button>
                        <button
                        type="button"
                        className="chal-btn go"
                        onClick={() => {
                            setResult(null);
                            setSlot(null);
                        }}
                        >
                            AGAIN
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}