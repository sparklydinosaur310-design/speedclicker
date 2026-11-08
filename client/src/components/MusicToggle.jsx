import { useState } from 'react';
import { isMuted, setMuted, startMusic } from '../game/music.js';
import './MusicToggle.css';

export default function MusicToggle() {
    const [muted, setMutedState] = useState(isMuted());

    function toggle() {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) startMusic();
    }

    return (
        <button type="button" className="music-toggle" onClick={toggle}>
            MUSIC: {muted ? 'OFF' : 'ON' }
        </button>
    );
}