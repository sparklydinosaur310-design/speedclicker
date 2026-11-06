import { useEffect, useRef } from 'react';

export default function PixelGrid({ rows, palette, scale = 10 }) {
    const ref = useRef(null);
    const width = rows[0].length;
    const height = rows.length;

    useEffect(() => {
        const ctx = ref.current.getContext('2d');
        ctx.clearRect(0, 0, width * scale, height * scale);
        rows.forEach((row, y) => {
            [...row].forEach((ch, x) => {
                if (ch === '.' || !palette[ch]) return;
                ctx.fillStyle = palette[ch];
                ctx.fillRect(x * scale, y * scale, scale, scale);
            });
        });
    }, [rows, palette, scale, width, height]);

    return (
        <canvas
        ref={ref}
        width={width * scale}
        height={height * scale}
        style={{ imageRendering: 'pixelated' }}
        />
    );
}