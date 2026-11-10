import { useState } from 'react';
import './SettingsMenu.css';
import { isMuted, setMuted, startMusic } from '../game/music.js';

export default function SettingsMenu({ onChangeAvatar, onLogout }) {
    const [open, setOpen] = useState(false);
    const [muted, setMutedState] = useState(isMuted());

    function toggleMusic() {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) startMusic();
    }

    return (
        <div className="settings">
            <button type="button" className="settings-btn" onClick={() => setOpen(!open)}>
                SETTINGS
            </button>
            {open && (
                <div className="settings-menu">
                    <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        onChangeAvatar();
                    }}
                >
                    CHANGE AVATAR
                </button>
                <button type="button" onClick={toggleMusic}>
                    Music: {muted ? 'OFF' : 'ON'}
                </button>
                <button type="button" onClick={onLogout}>LOG OUT</button>
                </div>
            )}
        </div>
    );
}