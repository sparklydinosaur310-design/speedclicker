import './NavBar.css';

const TABS = [
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'main', label: 'MAIN' },
    { id: 'challenge', label: 'CHALLENGE' },
];

export default function NavBar({ screen, onChange, badges = {} }) {
    return (
        <nav className="nav">
        {TABS.map((tab) => (
            <button
            type="button"
            key={tab.id}
            className={screen === tab.id ? 'on' : ''}
            onClick={() => onChange(tab.id)}
            >
                {tab.label}
                {badges[tab.id] > 0 && <span className="nav-badge">{badges[tab.id]}</span>}
            </button>
        ))}
        </nav>
    );
}