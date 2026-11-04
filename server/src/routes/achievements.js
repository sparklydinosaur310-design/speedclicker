import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import achievements from '../../../shared/data/achievements.json' with { type: 'json' };
import upgrades from '../../../shared/data/upgrades.json' with { type: 'json' };
import { spentOn } from '../../../shared/game/rules.js';

const router = Router();

function ruleMet(rule, earned) {
    if (rule.type === 'earned_at_least') return earned >= rule.value;
    return false;
}

router.get('/', requireAuth, async (req, res) => {
    const { data: state, error } = await supabase
    .from('game_state')
    .select('total_speed')
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
            claimable: !claimed.has(a.id) && ruleMet(a.rule, state.total_speed),
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

    if (!ruleMet(achievement.rule, state.total_speed)) {
        return res.status(400).json({ error: 'Not unlocked yet' });
    }

    const { error: claimError } = await supabase
    .from('achievements')
    .insert({ user_id: req.user.id, achievemnt_id: achievement.id });

    if (claimError) {
        if (claimError.code === '23505') {
            return res.status(400).json({ error: 'Already claimed' });
        }
        return res.status(500).json({ error: claimError.message });
    }

    const now = new Date().toISOString();
    const earned = state.total_speed + achievements.reward;
    const speed = earned - spentOn(upgrades, states.upgrades);

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