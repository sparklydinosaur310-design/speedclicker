import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api.js';
import './CoinCounter.css';

export default function CoinCounter({ refreshKey }) {
    const [coins, setCoins] = useState(0);
    const [rate, setRate] = useState(0);

    useEffect(() => {
        let cancelled = false;

        function load() {
            apiFetch('/api/coins')
            .then((res) => {
                if (cancelled || res.error) return;
                setCoins(res.coins);
                setRate(res.perSecond);
            })
            .catch(() => {});
        }

        load();
        const timer = setInterval(load, 15000);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [refreshKey]);

    useEffect(() => {
        if (rate <= 0) return;
        const tick = setInterval(() => setCoins((c) => c + rate), 1000);
        return () => clearInterval(tick);
    }, [rate]);

    return (
        <div className="coins">
            <span>COINS</span>
            <strong>{Math.floor(coins).toLocaleString()}</strong>
            {rate > 0 && <small>+{rate}/s</small>}
        </div>
    );
}