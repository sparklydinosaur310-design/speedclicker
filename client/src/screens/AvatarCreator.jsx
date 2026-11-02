import { useState } from 'react';
import PixelSprite from '../components/PixelSprite.jsx';
import { apiFetch } from '../api/api.js';
import data from '../../../shared/data/avatar.json';
import './AvatarCreator.css';

const DEFAULT_AVATAR = {
    skin: 0,
    hair: 'short',
    hairColor: 0,
    outfit: 'tee',
    outfitColor: 0,
    accessory: 'none',
};

function cycle(list, current, step) {
    const i = list.indexOf(current);
    return list[(i + step + list.length) % list.length];
}

function Picker({ label, options, value, onChange }) {
    return (
        <div className="picker">
            <span className="picker-label">{label}</span>
            <button type="button" onClick={() => onChange(cycle(options, value, -1))}>&lt;</button>
            <span className="picker-value">{value}</span>
            <button type="button" onClick={() => onChange(cycle(options, value, 1))}>&gt;</button>
        </div>
    );
}

function Swatches({ colors, value, onPick }) {
    return (
        <div className="swatches">
            {colors.map((color, i) => (
                <button
                type="button"
                key={color}
                className={i === value? 'swatch on' : 'swatch'}
                style={{ background: color }}
                onClick={() => onPick(i)}
                />
            ))}
        </div>
    );
}

export default function AvatarCreator({ initial, onSaved }) {
    const hasInitial = initial && Object.keys(initial).length > 0;
    const [avatar, setAvatar] = useState(hasInitial ? initial : DEFAULT_AVATAR);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const set = (key, value) => setAvatar({ ...avatar, [key]: value });

    async function handleNext() {
        setBusy(true);
        setError('');
        const result = await apiFetch('/api/profile/avatar', {
            method: 'PUT',
            body: JSON.stringify(avatar),
        });
        if (result.error) {
            setError(result.error);
                setBusy(false);
                return;
        }
        onSaved(result.avatar);
    }

    return (
        <div className="creator">
            <h1 className="creator-title">MAKE YOUR RUNNER</h1>
            <div className="creator-card">
                <PixelSprite avatar={avatar} scale={12} />

                <p className="creator-heading">SKIN</p>
                <Swatches colors={data.skinColors} value={avatar.skin} onPick={(i) => set('skin', i)} />

                <Picker label="HAIR" options={Object.keys(data.hair)} value={avatar.hair} onChange={(v) => set('hair', v)} />
                <Swatches colors={data.hairColors} value={avatar.hairColor} onPick={(i) => set('hairColor', i)} />
            
                <Picker label="OUTFIT" options={Object.keys(data.outfit)} value={avatar.outfit} onChange={(v) => set('outfit', v)} />
                <Swatches colors={data.outfitColors} value={avatar.outfitColor} onPick={(i) => set('outfitColor', i)} />
            
                <Picker label="EXTRA" options={Object.keys(data.accessory)} value={avatar.accessory} onChange={(v) => set('accessory', v)} />
            
                {error &&  <p className="creator-error">{error}</p>}
                <button type="button" className="creator-next" onClick={handleNext} disabled={busy}>
                {busy ? '...' : 'NEXT'}
                </button>
            </div>
        </div>
    );
}