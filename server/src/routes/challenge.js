import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import biomes from '../../../shared/data/biomes.json' with { type: 'json' };
import { currentWindow, rollEggs, secondsLeft } from '../../../shared/game/eggs.js';
import coinData from '../../../shared/data/coins.json' with { type: 'json' };
import { settleCoins } from '../services/coins.js';

const router = Router();

function eggStillOffered(biomeId, slot, tier) {
    const now = Date.now();
    const windowNum = currentWindow(now);
    const intoWindow = biomes.resetMinutes * 60 - secondsLeft(now);
    const windows = [windowNum];
    if (intoWindow < 10) windows.push(windowNum - 1);
    return windows.some((w) => rollEggs(biomeId, w)[slot]?.tier === tier);
}

router.post('/', requireAuth, async (req, res) => {
    const { biome: biomeId, slot, tier } = req.body ?? {};

    const biome = biomes.biomes.find((b) => b.id === biomeId);
    if(!biome) return res.status(400).json({ error: 'Unknown biome' });
    if (!Number.isInteger(slot) || slot < 0 || slot > 3) {
        return res.status(400).json({ error: 'Bad egg' });
    }
    if (!biomes.tiers[tier]) return res.status(400).json({ error: 'Bad egg' });

    if (!eggStillOffered(biome.id, slot, tier)) {
        return res.status(409).json({ error: 'The eggs changed. Pick again.' });
    }

    const { data: state, error } = await supabase
    .from('game_state')
    .select('total_speed')
    .eq('user_id', req.user.id)
    .maybeSingle();


    if (error) return res.status(500).json({ error: error.message });
    if (!state) return res.status(404).json({ error: 'No saved game' });

    const needed = Math.ceil(biome.npcSpeed * biomes.tiers[tier].multiplier);
    if (state.total_speed < needed) {
        return res.json({ won: false, needed, yours: state.total_speed });
    }

    const options = biome.creatures.filter((c) => c.tier === tier);
    const creature = options[Math.floor(Math.random() * options.length)];

    const settled = await settleCoins(req.user.id);
    if (settled.error) return res.status(500).json({ error: settled.error.message });

    const { error: insertError } = await supabase
    .from('inventory')
    .insert ({
        user_id: req.user.id,
        item_id: creature.id,
        biome: biome.id,
        rarity: creature.tier,
    });

    let duplicate = false;
    if (insertError) {
        if (insertError.code === '23505') duplicate = true;
        else return res.status(500).json({ error: insertError.message });
    }

    let bonus = 0;
    if (duplicate) {
        bonus = coinData.duplicate[creature.tier] ?? 0;
        const { error: bonusError } = await supabase
        .from('game_state')
        .update({ coins: settled.coins + bonus })
        .eq('user_id', req.user.id);

        if (bonusError) return res.status(500).json({ error: bonusError.message });
    }

    res.json({
        won: true,
        needed,
        yours: state.total_speed,
        duplicate,
        bonus,
        creature: { id: creature.id, name: creature.name, tier: creature.tier },
    });
});

export default router;