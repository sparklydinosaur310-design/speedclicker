import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import achievements from '../../../shared/data/achievements.json' with { type: 'json' };
import biomes from '../../../shared/data/biomes.json' with { type: 'json' };
import upgrades from '../../../shared/data/upgrades.json' with { type: 'json' };
import { spentOn } from '../../../shared/game/rules.js';

const router = Router();

function ruleMet(rule, ctx) {
    if (rule.type === 'earned_at_least') return ctx.earned >= rule.value;
    if (rule.type === 'collect_biome') {
        const biome = biomes.biomes.find((b) => b.id === rule.biome);
        if (!biome) return false;
        const have = biome.creatures.filter((c) => ctx.owned.has(c.id)).length;
        return have >= (rule.count ?? biome.creatures.length);
    }
    if (rule.type === 'collect_tier') {
        const have = biomes.biomes
            .flatMap((b) => b.creatures)
            .filter((c) => c.tier === rule.tier && ctx.owned.has(c.id)).length;
        return have >= (rule.count ?? 1);
    }
    return false;
}

async function loadOwned(userId) {
    const { data, error } = await supabase
    .from('inventory')
    .select('item_id')
    .eq('user_id', userId);

    if (error) return { error };
    return { owned: new Set(data.map((row) => row.item_id)) };
}

router.get('/', requireAuth, async (req, res) => {
    const { data: state, error } = await supabase
    .from('game_state')
    .select('total_speed, upgrades')
    .eq('user_id', req.user.id)
    .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!state) return res.status(404).json({ error: 'No saved game' });

    const { data: mine, error: mineError } = await supabase
    .from('achievements')
    .select('achievement_id')
    .eq('user_id', req.user.id );

    if (mineError) return res.status(500).json({ error: mineError.message });

    const claimed = new Set(mine.map((row) => row.achievement_id));
    const inventory = await loadOwned(req.user.id);
    if (inventory.error) return res.status(500).json({ error: inventory.error.message });
    const ctx = { earned: state.total_speed, owned: inventory.owned };
    const list = await Promise.all(achievements.map(async (a) => {
        const { count } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('achievement_id', a.id);

        return {
            id: a.id,
            name: a.name,
            description: a.description,
            reward: a.reward,
            claimed: claimed.has(a.id),
            claimable: !claimed.has(a.id) && ruleMet(a.rule, ctx),
            players: count ?? 0,
        };
    }));

    res.json(list);
});

router.post('/claim', requireAuth, async (req, res) => {
    const achievement = achievements.find((a) => a.id === req.body?.id);
    if (!achievement) return res.status(400).json({ error: 'Unknown achievement' });

    const { data: state, error } = await supabase
    .from('game_state')
    .select('total_speed, upgrades')
    .eq('user_id', req.user.id)
    .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!state) return res.status(404).json({ error: 'No saved game' });

    const inventory = await loadOwned(req.user.id);
    if (inventory.error) return res.status(500).json({ error: inventory.error.message });

    const ctx = { earned: state.total_speed, owned: inventory.owned };
    if (!ruleMet(achievement.rule, ctx)) {
        return res.status(400).json({ error: 'Not unlocked yet' });
    }

    const { error: claimError } = await supabase
    .from('achievements')
    .insert({ user_id: req.user.id, achievement_id: achievement.id });

    if (claimError) {
        if (claimError.code === '23505') {
            return res.status(400).json({ error: 'Already claimed' });
        }
        return res.status(500).json({ error: claimError.message });
    }

    const now = new Date().toISOString();
    const earned = state.total_speed + achievement.reward;
    const speed = earned - spentOn(upgrades, state.upgrades);

    const { error: saveError } = await supabase
    .from('game_state')
    .update({ speed, total_speed: earned })
    .eq('user_id', req.user.id);

    if (saveError) {
        await supabase
        .from('achievements')
        .delete()
        .eq('user_id', req.user.id)
        .eq('achievement_id', achievement.id);
        return res.status(500).json({ error: saveError.message });
    }

    await supabase
    .from('leaderboard')
    .update({ total_speed: earned, updated_at: now })
    .eq('user_id', req.user.id);

    res.json({ ok: true, reward: achievement.reward });
});

export default router;