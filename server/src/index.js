import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';
import { requireAuth } from './middleware/requireAuth.js';
import profileRoutes from './routes/profile.js';
import gameRoutes from './routes/game.js';
import achievementRoutes from './routes/achievements.js';
import eggRoutes from './routes/eggs.js';
import challengeRoutes from './routes/challenge.js';
import collectionRoutes from './routes/collection.js';
import coinRoutes from './routes/coins.js';
import decorRoutes from './routes/decor.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
    const { error } = await supabase.from('leaderboard').select('user_id').limit(1);
    res.json({ ok: !error, db: error ? error.message : 'connected' });
});

app.get('/api/me', requireAuth, (req, res) => {
    res.json({ id: req.user.id, email: req.user.email });
});

app.use('/api/profile', profileRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/eggs', eggRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/decor', decorRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));