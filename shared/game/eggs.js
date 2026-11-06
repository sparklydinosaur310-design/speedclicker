import biomes from '../data/biomes.json' with { type: 'json' };

const tierNames = Object.keys(biomes.tiers);

function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
}

function makeRng(seed) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function currentWindow(now = Date.now()) {
    return Math.floor(now / (biomes.resetMinutes * 60000));
}

export function secondsLeft(now = Date.now()) {
    const ms = biomes.resetMinutes * 60000;
    return Math.ceil((ms - (now % ms)) / 1000);
}

export function rollEggs(biomeId, windowNum) {
    const rng = makeRng(hash(`${windowNum}:${biomeId}`));
    const total = tierNames.reduce((sum, t) => sum + biomes.tiers[t].weight, 0);
    let legendaryCount = 0;
    const eggs = [];

    for (let slot = 0; slot < 4; slot++) {
        let roll = rng() * total;
        let tier = tierNames[tierNames.length - 1];
        for (const t of tierNames) {
            roll -= biomes.tiers[t].weight;
            if (roll < 0) {
                tier = t;
                break;
            }
        }
        if (tier === 'legendary') {
            legendaryCount++;
            if (legendaryCount > biomes.maxLegendaryPerBiome) tier = 'mythical';
        }
        eggs.push({ slot, tier });
    }
    return eggs;
}