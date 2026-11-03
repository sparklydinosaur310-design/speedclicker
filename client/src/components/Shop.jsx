import upgrades from '../../../shared/data/upgrades.json';
import { costOf } from '../game/upgrades.js';
import './Shop.css';

export default function Shop({ speed, levels, onBuy }) {
    return (
        <aside className="shop">
            <h2 className="shop-title">SHOP</h2>
            {upgrades.map((up) => {
                const level = levels[up.id] || 0;
                const cost = costOf(up, level);
                return (
                    <button
                    type="button"
                    key={up.id}
                    className="shop-item"
                    disabled={speed < cost}
                    onClick={() => onBuy(up.id)}
                    >
                        <span className="shop-name">{up.name}</span>
                        <span className="shop-right">LV {level}</span>
                        <span className="shop-cost">{cost.toLocaleString()}</span>
                        <span className="shop-right">{up.desc}</span>
                    </button>
                );
            })}
        </aside>
    );
}