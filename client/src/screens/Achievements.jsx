import {  useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import './Achievements.css';

export default function Achievements({ onClaimed }) {
    const [list, setList] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(null);

    function refresh() {
        apiFetch('/api/achievements')
        .then((data) => {
            if (data.error) return setError(data.error);
            setList(data);
        })
        .catch(() => setError('Could not load achievements'));
    }

    useEffect(() => {
        refresh();
    }, []);

    async function claim(id) {
        setBusy(id);
        setError('');
        try {
            const res = await apiFetch('/api/achievements/claim', {
                method: 'POST',
                body: JSON.stringify({ id }),
            });
            if (res.error) setError(res.error);
            else onClaimed(res.reward);
        } catch {
            setError('Claim failed');
        }
        setBusy(null);
        refresh();
    }

    return (
        <div className="achievements">
            <h1>ACHIEVEMENTS</h1>
            {error && <p className="ach-error">{error}</p>}
            {!list && !error && <p>LOADING...</p>}
            <ul className="ach-list">
                {list?.map((a) => (
                    <li key={a.id} className={`ach ${a.claimed ? 'done' : ''}`}>
                        <div className="ach-info">
                            <strong>{a.name}</strong>
                            <span>{a.description}</span>
                            <span className="ach-meta">
                                +{a.reward} speed · {a.players} {a.players === 1 ? 'player' : 'players'} got this
                            </span>
                        </div>
                        <button
                        className="ach-btn"
                        disabled={!a.claimable || busy === a.id}
                        onClick={() => claim(a.id)}
                        >
                            {a.claimed ? 'CLAIMED' : 'CLAIM'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}