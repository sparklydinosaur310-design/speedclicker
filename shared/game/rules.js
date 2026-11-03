export const MAX_CLICKS_PER_SECOND = 15;

export function costOf(up, level) {
    return Math.floor(up.baseCost * Math.pow(up.growth, level));
}

export function spentOn(upgrades, levels) {
    let total = 0;
    upgrades.forEach((up) => {
        const level = levels[up.id] || 0;
        for (let i = 0; i < level; i++) total += costOf(up, i);
    });
    return total;
}

export function ratesFor(upgrades, levels) {
    let perClick = 1;
    let perSecond = 0;
    upgrades.forEach((up) => {
        const level = levels[up.id] || 0;
        if (up.kind === 'click') perClick += level * up.gain;
        if (up.kind === 'treadmill') perSecond += level * up.gain;
    });
    return { perClick, perSecond };
}