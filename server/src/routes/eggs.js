import { Router } from 'express';
import biomes from '../../../shared/data/biomes.json' with { type: 'json' };
import { currentWindow, rollEggs, secondsLeft } from '../../../shared/game/eggs.js';

const router = Router();

router.get('/', (req, res) => {
    const windowNum = currentWindow();
    res.json({
        resetsIn: secondsLeft(),
        biomes: biomes.biomes.map((b) => ({
            id: b.id,
            name: b.name,
            npc: b.npc,
            npcSpeed: b.npcSpeed,
            eggs: rollEggs(b.id, windowNum),
        })),
    });
});

export default router;