import { useState } from 'react';
import PixelSprite from '../components/PixelSprite';
import Shop from '../components/Shop.jsx';
import './Main.css';

export default function Main({ avatar, speed, perClick, levels, onRun, onBuy }) {
    const [pops, setPops] = useState([]);

    function handleRun() {
        onRun();
        const id = Math.random() * 40;
        const left = 30 + Math.random() * 40;
        setPops((p) => [...p, { id, left, }]);
        setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 800);
    }

    return (
        <div className="main">
            <div className="main-play">
                <h1 className="main-speed">{Math.floor(speed).toLocaleString()}</h1>
                <div className="main-stage">
                    <button type="button" className="main-avatar" onClick={handleRun}>
                        <PixelSprite avatar={avatar} scale={20} />
                    </button>
                    {pops.map((p) => (
                        <span key={p.id} className="pop" style={{ left: `${p.left}%` }}>
                            +{perClick.toLocaleString()}
                        </span>
                    ))}
                </div>
            </div>
            <Shop speed={speed} levels={levels} onBuy={onBuy} />
        </div>
    );
}