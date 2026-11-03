import upgrades from '../../../shared/data/upgrades.json' with { type: 'json' };
import { MAX_CLICKS_PER_SECOND, ratesFor, spentOn } from '../../../shared/game/rules.js';

const MAX_ELAPSED_SECONDS = 120;
const GRACE_SECONDS = 2;
const MAX_LEVEL = 1000;

const fail = (reason) => ({ ok: false, reason });

export function validateSave(body, stored, now = Date.now()) {
    if (!body || typeof body !== 'object') return fail('Bad request');

    const sent = body.levels && typeof body.levels === 'object' ? body.levels : {};
    for (const key of Object.keys(sent)) {
        if (!upgrades.some((u) => u.id === key)) return fail('Unknown upgrade');
    }
    const levels = {};
    for (const up of upgrades) {
        const level = sent[up.id] ?? 0;
        if (!Number.isInteger(level) || level < 0 || level > MAX_LEVEL) return fail('Bad level');
        if (level < (stored.upgrades?.[up.id] || 0)) return fail('Level went down');
        levels[up.id] = level;
    }

    const earned = body.earned;
    if (!Number.isSafeInteger(earned) || earned < 0) return fail('Bad speed');
    if (earned < stored.total_speed) return fail('Speed went down');
    if (spentOn(upgrades, levels) > earned) return fail('Upgrades cost more than earned');

    const elapsed = (now - new Date(stored.last_saved_at).getTime()) / 1000;
    const seconds = Math.min(Math.max(elapsed, 0), MAX_ELAPSED_SECONDS) + GRACE_SECONDS;
    const { perClick, perSecond } = ratesFor(upgrades, levels);
    const maxGain = seconds * (MAX_CLICKS_PER_SECOND * perClick + perSecond);
    if (earned - stored.total_speed > maxGain) return fail('Speed gained too fast');

    return { ok: true, levels, earned };
}