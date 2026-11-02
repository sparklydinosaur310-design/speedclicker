import { useEffect, useRef } from 'react';
import data from '../../../shared/data/avatar.json';

function drawLayer(ctx, layer, colors, scale) {
    layer.rows.forEach((row, i) => {
        [...row].forEach((ch, x) => {
            if (ch === '.') return
            ctx.fillStyle = colors[ch];
            ctx.fillRect(x * scale, (layer.y + i) * scale, scale, scale);
        });
    });
}

export default function PixelSprite({ avatar, scale = 10 }) {
    const ref = useRef(null);

    useEffect (() => {
        const ctx = ref.current.getContext('2d');
        ctx.clearRect(0, 0, data.size * scale, data.size * scale);

        const colors = {
            ...data.palette,
            s: data.skinColors[avatar.skin],
            h: data.hairColors[avatar.hairColor],
            o: data.outfitColors[avatar.outfitColor],
        };

        [
            data.body,
            data.outfit[avatar.outfit],
            data.hair[avatar.hair],
            data.accessory[avatar.accessory],
        ].forEach((layer) => drawLayer(ctx, layer, colors, scale));
    }, [avatar, scale]);

    return (
        <canvas
        ref={ref}
        width={data.size * scale}
        height={data.size * scale}
        style={{ imageRendering: 'pixelated' }}
        />
    );
}