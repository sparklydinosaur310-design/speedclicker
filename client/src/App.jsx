import { useEffect, useState } from 'react';
import { supabase } from './api/supabase.js';
import { apiFetch } from './api/api.js';
import Login from './screens/Login.jsx';
import AvatarCreator from './screens/AvatarCreator.jsx';
import SettingsMenu from './components/SettingsMenu.jsx';
import Main from './screens/Main.jsx';
import NavBar from './components/NavBar.jsx';
import { useGame } from './game/useGame.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('main');
  const game = useGame();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    
    return() => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    apiFetch('/api/profile', { method: 'POST' }).then((data) => setProfile(data));
  }, [session]);

  if (loading) return <h1>LOADING...</h1>;
  if (!session) return <Login />;
  if (!profile) return <h1>LOADING PROFILE...</h1>;
  if (profile.error) return <h1>{profile.error}</h1>;

  const hasAvatar = Object.keys(profile.profile.avatar || {}).length > 0;
  if (!hasAvatar || screen === 'avatar') {
    return (
      <AvatarCreator
      initial={profile.profile.avatar}
      onCancel={hasAvatar ? () => setScreen('main') : undefined}
      onSaved={(avatar) => {
        setProfile({ ...profile, profile: { ...profile.profile, avatar } });
        setScreen('main');
      }}
      />
    );
  }

  return (
    <>
      <SettingsMenu
        onChangeAvatar={() => setScreen('avatar')}
        onLogout={() => supabase.auth.signOut()}
      />

      {screen === 'main' && (
        <Main
        avatar={profile.profile.avatar}
        speed={game.speed}
        perClick={game.perClick}
        levels={game.levels}
        perSecond={game.perSecond}
        onRun={game.run}
        onBuy={game.buy}
        />
      )}
      {screen === 'achievements' && <h1 style={{ padding: '90px 24px' }}>ACHIEVEMENTS</h1>}
      {screen === 'challenge' && <h1 style={{ padding: '90px 24px' }}>CHALLENGE</h1>}

      <NavBar screen={screen} onChange={setScreen} />
      </>
  )};