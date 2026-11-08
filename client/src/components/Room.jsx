import PixelGrid from './PixelGrid.jsx';
import decor from '../../../shared/data/decor.json';
import { PROP_SPRITES } from './propSprites.js';
import './Room.css';

export default function Room({ biomeId, data, busy, error, onBuy, onBack }) {
    const bg = decor.backgrounds.find((b) => b.id === biomeId);
    const props = decor.props.filter((p) => p.biome === biomeId);

    return (
        <div className="room">
            <h1>{bg.name.toUpperCase()} ROOM</h1>
            {error && <p className="room-error">{error}</p>}

            <div 
            className="room-scene"
            style={{ background: `linear-gradient(${bg.top}, ${bg.bottom})` }}
            >
                {props
                .filter((p) => data.owned.includes(p.id) && PROP_SPRITES[p.id])
                .map((p) => (
                    <div
                        key={p.id}
                        className="room-prop"
                        style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
                        >
                        <PixelGrid
                            rows={PROP_SPRITES[p.id].rows}
                            palette={PROP_SPRITES[p.id].colors}
                            scale={p.scale}
                        />
                    </div>
                ))}
            </div>

            {props.length === 0 && <p>PROPS FOR THIS BIOME ARE COMMING SOON.</p>}

            <div className="room-shop">
                {props
                .filter((p) => PROP_SPRITES[p.id])
                .map((p) => {
                    const owned = data.owned.includes(p.id);
                    return (
                        <div key={p.id} className="room-card">
                            <div className="room-thumb">
                                <PixelGrid
                                    rows={PROP_SPRITES[p.id].rows}
                                    palette={PROP_SPRITES[p.id].colors}
                                    scale={3}
                                />
                            </div>
                            <strong>{p.name}</strong>
                            {owned ? (
                                <button type="button" className="chal-btn" disabled>OWNED</button>
                            ) : (
                                <button
                                    type="button"
                                    className="chal-btn go"
                                    disabled={data.coins < p.price || busy === p.id}
                                    onClick={() => onBuy(p.id)}
                                >
                                    BUY {p.price.toLocaleString()}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <button type="button" className="chal-btn" onClick={onBack}>BACK</button>
        </div>
    );
}