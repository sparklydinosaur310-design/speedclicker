import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { settleCoins } from '../services/coins.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
    const result = await settleCoins(req.user.id);
    if (result.error) return res.status(500).json({ error: result.error.message });
    if (result.notFound) return res.status(404).json({ error: 'No saved game' });
    res.json({ coins: result.coins, perSecond: result.rate });
});

export default router;