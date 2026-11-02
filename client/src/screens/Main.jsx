import PixelSprite from "../components/PixelSprite";
import './Main.css';

export default function Main({ avatar, speed, perClick, perSecond, onRun }) {
    return (
        <div className="main">
            <h1 className="main-speed">{Math.floor(speed).toLocaleString()}</h1>
            <p className="main-rates">{perClick} PER CLICK / {perSecond} PER SECOND</p>
            <button type="button" className="main-avatar" onClick={onRun}>
                <PixelSprite avatar={avatar} scale={20} />
            </button>
        </div>
    );
}