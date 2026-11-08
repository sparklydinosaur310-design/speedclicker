import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router= Router();

router.get('/', requireAuth, async (req, res) => {
    const { data, error } = await supabase
    .from('inventory')
    .select('item_id')
    .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });
        res.json({ owned: data.map((row) => row.item_id) });
    });

    export default router;