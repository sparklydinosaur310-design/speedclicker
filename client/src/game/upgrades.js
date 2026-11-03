import upgrades from '../../../shared/data/upgrades.json';
import { costOf , ratesFor as rates, spentOn as spent } from '../../../shared/game/rules.js';

export { costOf };

export function ratesFor(levels) {
    return rates(upgrades, levels);
}

export function spentOn(levels) {
    return spent(upgrades, levels);
}