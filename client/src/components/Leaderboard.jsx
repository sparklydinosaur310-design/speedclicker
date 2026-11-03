import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase.js';
import './Leaderboard.css';

export default function Leaderboard({ userId }) {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
            .from('leaderboard')
            .select('user_id, username, total_speed')
            .order('total_speed', { ascending: false })
            .limit(10);
            if (data) setRows(data);
        }

        load();

        const channel = supabase
        .channel('leaderboard-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'leaderboard' },
            load
        )
        .subscribe();

        return() => {
            supabase.removeChannel(channel);
        };
    }, []);
    
    return (
        <aside className="board">
            <h2 className="board-title">TOP RUNNERS</h2>
            {rows.map((row, i) => (
                <div
                key={row.user_id}
                className={row.user_id === userId ? 'board-row me' : 'board-row'}
                >
                    <span className="board-rank">{i + 1}</span>
                    <span className="board-name">{row.username}</span>
                    <span className="board-speed">{Math.floor(row.total_speed).toLocaleString()}</span>
                </div>
            ))}
        </aside>
    );
}