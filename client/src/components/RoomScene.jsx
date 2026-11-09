import PixelGrid from './PixelGrid.jsx';
import decor from '../../../shared/data/decor.json';
import { PROP_SPRITES } from './propSprites.js';
import './Room.css';

export default function RoomScene({ biomeId, owned }) {
    const bg = decor.backgrounds.find((b) => b.id === biomeId);
    if (!bg) return null;

    return (
        <div
        className="room-scene"
        style={{ background: `linear-gradient(${bg.top}, ${bg.bottom})` }}
        >
            {decor.props
            .filter((p) => p.biome === biomeId && owned.includes(p.id) && PROP_SPRITES[p.id])
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
    );
}