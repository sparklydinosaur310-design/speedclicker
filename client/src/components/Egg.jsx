import PixelGrid from "./PixelGrid";
import biomes from '../../../shared/data/biomes.json';
import './Egg.css';

const EGG_ROWS = [
    '....oooo....',
    '...ollbbo...',
    '..ollbbbbo..',
    '..olbbbbbo..',
    '.olbbabbbbbo',
    '.olbbbbbbbdo',
    '.obbbbbabbdo',
    '.obbbbbbbddo',
    'obbabbbbbddo',
    '.obbbbbbbddo',
    '..obbbbbddo.',
    '..oddddddo..',
    '...oddddo...',
    '....oooo....',
];

export default function Egg({ tier, scale = 8 }) {
    return (
        <div className={`egg egg-${tier}`}>
            <PixelGrid rows={EGG_ROWS} palette={biomes.tiers[tier].colors} scale={scale} />
        </div>
    );
}