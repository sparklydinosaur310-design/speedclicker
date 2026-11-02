import { useState } from 'react';
import './SettingsMenu.css';

export default function SettingsMenu({ onChangeAvatar, onLogout }) {
    const [open, setOpen] = useState(false);

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
                <button type="button" onClick={onLogout}>LOG OUT</button>
                </div>
            )}
        </div>
    );
}