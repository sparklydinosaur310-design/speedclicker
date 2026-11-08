import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import decor from '../../../shared/data/decor.json';
import './Decor.css';

export default function Decor({ onChange }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(null);
    const [preview, setPreview] = useState(null);

    function load() {
        apiFetch('/api/decor')
        .then((res) => {
            if (res.error) return setError(res.error);
            setData(res);
            setPreview((p) => p ?? res.background ?? decor.backgrounds[0].id);
        })
        .catch(() => setError('Could not load decor'));
    }

    useEffect(() => {
        load();
        const timer = setInterval(load, 15000);
        return () => clearInterval(timer);
    }, []);

    async function act(path, id) {
        setBusy(id ?? 'none');
        setError('');
        try {
            const res = await apiFetch(`/api/decor/${path}`, {
                method: 'POST',
                body: JSON.stringify({ id }),
            });
            if (res.error) setError(res.error);
            else onChange?.();
        } catch {
            setError('That did not work');
        }
        setBusy(null);
        load();
    }

    const shown = decor.backgrounds.find((b) => b.id === preview);

    return (
        <div className="decor">
            <h1>DECOR</h1>
            {error && <p className="decor-error">{error}</p>}
            {!data && !error && <p>LOADING...</p>}
            {data && (
                <>
                <div
                className="decor-preview"
                style={{
                    background: shown
                    ? `linear-gradient(${shown.top}, ${shown.bottom})`
                    : '#16213e'
                }}
                >
                    <span className="decor-label">{shown ? shown.name : 'NO BACKGROUND'}</span>
                </div>

                {data.background && (
                    <button
                    type="button"
                    className="chal-btn"
                    disabled={busy === 'none'}
                    onClick={() => act('equip', null)}
                    >
                        REMOVE BACKGROUND
                    </button>
                )}

                <div className="decor-grid">
                    {decor.backgrounds.map((b) => {
                        const owned = data.owned.includes(b.id);
                        const equipped = data.background === b.id;
                        const affordable = data.coins >= b.price;
                        return (
                            <div
                                key={b.id}
                                className={`decor-card${preview === b.id ? ' pick' : ''}`}
                                onClick={() => setPreview(b.id)}
                            >
                                <div
                                    className="decor-swatch"
                                    style={{ background: `'inear-gradient(${b.top}, ${b.bottom}` }}
                                />
                                <strong>{b.name}</strong>
                                {equipped ? (
                                    <button type="button" className="chal-btn" disabled>EQUIPPED</button>
                                ) : owned ? (
                                    <button
                                    type="button"
                                    className="chal-btn go"
                                    disabled={busy === b.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        act('equip', b.id);
                                    }}
                                    >
                                        EQUIP
                                    </button>
                                ) : (
                                    <button
                                    type="button"
                                    className="chal-btn go"
                                    disabled={!affordable || busy === b.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        act('buy', b.id);
                                    }}
                                    >
                                        BUY {b.price.toLocaleString()}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                </>
            )}
        </div>
    );
}