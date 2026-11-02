import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import avatarData from '../../../shared/data/avatar.json' with { type: 'json' };

const router = Router();

async function loadPlayer(userId) {
    const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .eq('id', userId)
    .maybeSingle();

    const { data: state } = await supabase
    .from('game_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

    return { profile, state };
}

router.post('/', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const username = req.user.user_metadata?.username;

    if (!username) {
        return res.status(400).json({ error: 'Account has no username' });
    }

    const existing = await loadPlayer(userId);
    if (existing.profile) {
        return res.json(existing);
    }

    const { error } = await supabase.from('profiles').insert({ id: userId, username });
    if (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username already taken' });
    }
        return res.status(500).json({ error: error.message });
    }

    await supabase.from('game_state').insert({ user_id: userId });
    await supabase.from('leaderboard').insert({ user_id: userId, username });

    res.status(201).json(await loadPlayer(userId));
});

function cleanAvatar(a) {
    if (!a || typeof a !== 'object') return null;
    const inRange = (n, list) => Number.isInteger(n) && n >= 0 && n < list.length;
    const has = (obj, key) => typeof key === 'string' && Object.hasOwn(obj, key);

    if (!inRange(a.skin, avatarData.skinColors)) return null;
    if (!inRange(a.hairColor, avatarData.hairColors)) return null;
    if (!inRange(a.outfitColor, avatarData.outfitColors)) return null;
    if (!has(avatarData.hair, a.hair)) return null;
    if (!has(avatarData.outfit, a.outfit)) return null;
    if (!has(avatarData.accessory, a.accessory)) return null;

    const { skin, hair, hairColor, outfit, outfitColor, accessory } = a;
    return { skin, hair, hairColor, outfit, outfitColor, accessory };
}

router.put('/avatar', requireAuth, async (req, res) => {
    const avatar = cleanAvatar(req.body);
    if (!avatar) {
        return res.status(400).json({ error: 'Invalid avatar' });
    }

    const { error } = await supabase
    .from('profiles')
    .update({ avatar })
    .eq('id', req.user.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json({ avatar });
});

export default router;