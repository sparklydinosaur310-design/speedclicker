import './NavBar.css';

const TABS = [
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'main', label: 'MAIN' },
    { id: 'challenge', label: 'CHALLENGE' },
];

export default function NavBar({ screen, onChange }) {
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
            </button>
        ))}
        </nav>
    );
}