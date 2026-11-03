import { useEffect, useState } from 'react';
import PixelSprite from '../components/PixelSprite';
import Shop from '../components/Shop.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import './Main.css';

export default function Main({ avatar, speed, perClick, perSecond, levels, userId, earned, onRun, onBuy }) {
    const [pops, setPops] = useState([]);

    function addPop(amount, passive) {
        const id = Math.random();
        const left = passive ? 70 + Math.random() * 25 : 30 + Math.random() * 40;
        setPops((p) => [...p, { id, left, amount, passive }]);
        setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 800);
    }

    function handleRun() {
        onRun();
        addPop(perClick, false);
    }

    useEffect(() => {
        if (perSecond <= 0) return;
        const timer = setInterval(() => addPop(perSecond, true), 1000);
        return () => clearInterval(timer);
    }, [perSecond]);

    return (
        <div className="main">
            <Leaderboard userId={userId} earned={earned} />
            <div className="main-play">
                <h1 className="main-speed">{Math.floor(speed).toLocaleString()}</h1>
                <div className="main-stage">
                    <button type="button" className="main-avatar" onClick={handleRun}>
                        <PixelSprite avatar={avatar} scale={20} />
                    </button>
                    {pops.map((p) => (
                        <span 
                            key={p.id}
                            className={p.passive ? 'pop passive' : 'pop'}
                            style={{ left: `${p.left}%` }}
                            >
                            +{p.amount.toLocaleString()}
                        </span>
                    ))}
                </div>
            </div>
            <Shop speed={speed} levels={levels} onBuy={onBuy} />
        </div>
    );
}