const files = Object.values(
    import.meta.glob('../assets/audio/*.{mp3,ogg,wav,m4a}', { eager : true, import: 'default' })
);

const VOLUME = 0.4;

let audio = null;
let index = 0;
let muted = false;
let started = false;

try {
    muted = localStorage.getItem('music-muted') === '1';
} catch {
    muted = false;
}

function load(i) {
    index = i % files.length;
    audio.src = files[index];
    audio.loop = files.length === 1;
}

export function startMusic() {
    if (files.length === 0) return;
    if (!audio) {
        audio = new Audio();
        audio.volume = VOLUME;
        audio.addEventListener('ended', () => {
            load(index + 1);
            audio.play().catch(() => {});
        });
        load(0);
    }
    started = true;
    audio.muted = muted;
    audio.play().catch(() => {});
}

export function isMuted() {
    return muted;
}

export function setMuted(value) {
    muted = value;
    try {
        localStorage.setItem('music-muted', value ? '1' : '0');
    } catch {

    }
    if (audio) audio.muted = value;
}

export function startMusicOnFirstClick() {
    const onGesture = () => {
        document.removeEventListener('pointerdown', onGesture);
        document.removeEventListener('keydown', onGesture);
        if (!muted) startMusic();
    };
    const onVisibility = () => {
        if (!audio || !started) return;
        if (document.hidden) audio.pause();
        else if (!muted) audio.play().catch(() => {});
    };

    document.addEventListener('pointerdown', onGesture);
    document.addEventListener('keydown', onGesture);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
        document.removeEventListener('pointerdown', onGesture);
        document.removeEventListener('keydown', onGesture);
        document.removeEventListener('visibilitychange', onVisibility);
    };
}
