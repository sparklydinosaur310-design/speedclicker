import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateSave } from '../services/validateSave.js';
import upgrades from '../../../shared/data/upgrades.json' with { type: 'json' };
import { spentOn } from '../../../shared/game/rules.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
    const { data, error } = await supabase
    .from('game_state')
    .select('total_speed, upgrades')
    .eq('user_id', req.user.id)
    .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'No saved game' });

    res.json({ earned: data.total_speed, levels: data.upgrades });
});

router.put('/', requireAuth, async (req, res) => {
    const { data: stored, error } = await supabase
    .from('game_state')
    .select('total_speed, upgrades, last_saved_at')
    .eq('user_id', req.user.id)
    .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!stored) return res.status(404).json ({ error: 'No saved game' });
    
    const result = validateSave(req.body, stored);
    if (!result.ok) return res.status(400).json ({ error: result.reason });

    const now = new Date().toISOString();
    const speed = result.earned - spentOn(upgrades, result.levels);

    const { error: saveError } = await supabase
    .from('game_state')
    .update ({
        speed,
        total_speed: result.earned,
        upgrades: result.levels,
        last_saved_at: now,
    })
    .eq('user_id', req.user.id);

    if (saveError) return res.status(500).json({ error: saveError.message });

    await supabase
    .from ('leaderboard')
    .update({ total_speed: result.earned, updated_at: now })
    .eq('user_id', req.user.id);

    res.json({ ok: true });
});

export default router;