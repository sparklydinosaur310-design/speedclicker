import PixelGrid from './PixelGrid.jsx';
import biomes from '../../../shared/data/biomes.json';
import { CREATURE_SPRITES } from './creatureSprites.js';

const PLACEHOLDER_ROWS = [
    '..oo....oo..',
    '.obbo..obbo.',
    '.obbbbbbbbo.',
    'obbbbbbbbbbo',
    'obbobbbbobbo',
    'obbobbbbobbo',
    'obbbbaabbbbo',
    'obllbbbbllbo',
    '.obbbbbbbbo.',
    '.oddddddddo.',
    '..oo....oo..',
];

export default function Creature({ id, tier, scale = 8 }) {
    const sprite = CREATURE_SPRITES[id];
    const rows = sprite ? sprite.rows : PLACEHOLDER_ROWS;
    const palette = sprite ? sprite.colors : biomes.tiers[tier].colors;
    return <PixelGrid rows={rows} palette={palette} scale={scale} />;
}