import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { settleCoins } from '../services/coins.js';
import decor from '../../../shared/data/decor.json' with { type: 'json' };

const router = Router();

async function loadOwned(userId) {
    const { data, error } = await supabase
    .from('decor')
    .select('decor_id')
    .eq('user_id', userId);

    if (error) return { error };
    return { owned: data.map((row) => row.decor_id) };
}

router.get('/', requireAuth, async (req, res) => {
    const settled = await settleCoins(req.user.id);
    if (settled.error) return res.status(500).json({ error: settled.error.message });
    if (settled.notFound) return res.status(404).json({ error: 'No saved game' });

    const { data: state, error } = await supabase
    .from('game_state')
    .select('background')
    .eq('user_id', req.user.id)
    .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    const inventory = await loadOwned(req.user.id);
    if (inventory.error) return res.status(500).json({ error: inventory.error.message });

    res.json({
        coins: settled.coins,
        owned: inventory.owned,
        background: state?.background ?? null,
    });
});

router.post('/buy', requireAuth, async (req,res) => {
    const id = req.body?.id;
    const item =
        decor.backgrounds.find((b) => b.id === id) ??
        decor.props.find((p) => p.id === id);
    if (!item) return res.status(400).json({ error: 'Unknown item' });
    
    const settled = await settleCoins(req.user.id);
    if (settled.error) return res.status(500).json({ error: settled.error.message });
    if (settled.notFound) return res.status(404).json({ error: 'No saved game' });
    if (item.biome) {
        const { data: owns, error: ownsError } = await supabase
        .from('decor')
        .select('decor_id')
        .eq('user_id', req.user.id)
        .eq('decor_id', item.biome)
        .maybeSingle();

        if (ownsError) return res.status(500).json({ error: ownsError.message });
        if (!owns) return res.status(400).json({ error: 'Buy this background first' });
    }

    if (settled.coins < item.price) {
        return res.status(400).json({ error: 'Not enough coins' });
    }

    const { error: insertError } = await supabase
    .from('decor')
    .insert({ user_id: req.user.id, decor_id: item.id });

    if (insertError) {
        if (insertError.code === '23505') {
            return res.status(400).json({ error: 'You already own this' });
        }
        return res.status(500).json({ error: insertError.message });
    }

    const coins = settled.coins - item.price;
    const { error: saveError } = await supabase
    .from('game_state')
    .update({ coins })
    .eq('user_id', req.user.id);

    if (saveError) {
        await supabase
        .from('decor')
        .delete()
        .eq('user_id', req.user.id)
        .eq('decor_id', item.id);
        return res.status(500).json({ error: saveError.message });
    }

    res.json({ ok: true, coins });
});

router.post('/equip', requireAuth, async (req, res) => {
    const id = req.body?.id ?? null;

    if (id !== null) {
        if (!decor.backgrounds.some((b) => b.id === id)) {
            return res.status(400).json({ error: 'Unknown background' });
        }
        
        const { data, error } = await supabase
        .from('decor')
        .select('decor_id')
        .eq('user_id', req.user.id)
        .eq('decor_id', id)
        .maybeSingle();

        if (error) return res.status(500).json({ error: error.message });
        if (!data) return res.status(400).json({ error: 'You do not own this' });
    }

    const { error: saveError } = await supabase
    .from('game_state')
    .update({ background: id })
    .eq('user_id', req.user.id);

    if (saveError) return res.status(500).json({ error: saveError.message });
    res.json({ ok: true, background: id });
});

export default router;