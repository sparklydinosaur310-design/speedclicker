import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
    const { error } = await supabase.from('leaderboard').select('user_id').limit(1);
    res.json({ ok: !error, db: error ? error.message : 'connected' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
