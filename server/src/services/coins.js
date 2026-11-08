import { supabase } from '../db/supabase.js';
import coinData from '../../../shared/data/coins.json' with { type: 'json' };

export function rateFor(rarities) {
    return rarities.reduce((sum, r) => sum + (coinData.perSecond[r] ?? 0), 0);
}

export async function settleCoins(userId) {
    const { data: state, error } = await supabase
    .from('game_state')
    .select('coins, coins_updated_at')
    .eq('user_id', userId)
    .maybeSingle();

    if (error) return { error };
    if (!state) return { notFound: true };

    const { data: inv, error: invError } = await supabase
    .from('inventory')
    .select('rarity')
    .eq('user_id', userId);

    if (invError) return { error: invError };
    
    const rate = rateFor(inv.map((row) => row.rarity));
    const now = Date.now();
    const last = new Date(state.coins_updated_at).getTime();
    const elapsed = Math.max(0, Math.floor((now - last) / 1000));
    const seconds = Math.min(elapsed, coinData.capSeconds);
    const coins = Number(state.coins) + rate * seconds;
    const stamp = elapsed > coinData.capSeconds ? now : last + seconds * 1000;

    if (seconds > 0) {
        const { error: saveError } = await supabase
        .from('game_state')
        .update({ coins, coins_updated_at: new Date(stamp).toISOString() })
        .eq('user_id', userId);

        if (saveError) return { error: saveError };
    }
    
    return { coins, rate };
}