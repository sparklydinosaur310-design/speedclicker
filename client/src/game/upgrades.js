import upgrades from '../../../shared/data/upgrades.json';

export function costOf(up, level) {
    return Math.floor(up.baseCost * Math.pow(up.growth, level));
}

export function ratesFor(levels) {
    let perClick = 1;
    let perSecond = 0;
    upgrades.forEach((up) => {
        const level = levels[up.id] || 0;
        if (up.kind === 'click') perClick += level * up.gain;
        if (up.kind === 'treadmill') perSecond += level * up.gain;
    });
    return { perClick, perSecond };
}