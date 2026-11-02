import { useEffect, useState } from 'react';
import { supabase } from './api/supabase.js';
import { apiFetch } from './api/api.js';
import Login from './screens/Login.jsx';
import AvatarCreator from './screens/AvatarCreator.jsx';
import PixelSprite from './components/PixelSprite.jsx'
import SettingsMenu from './components/SettingsMenu.jsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiResult, setApiResult] = useState('');
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('main');

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

  //temporary test screen
  return (
    <div style={{padding:24}}>
      <SettingsMenu
      onChangeAvatar={() => setScreen('avatar')}
      onLogout={() => supabase.auth.signOut()}
      />
      <h1>Logged in as {session.user.email}</h1>
      <p>{profile?.profile ? `Player: ${profile.profile.username}` : profile?.error || 'Loading profile...'}</p>
      <PixelSprite avatar={profile.profile.avatar} scale={12} />
      <button onClick={async () => setApiResult(JSON.stringify(await apiFetch('/api/me')))}>
      TEST SERVER
      </button>
      <button onClick={() => supabase.auth.signOut()}>LOG OUT</button>
      <p>{apiResult}</p>
    </div>
  );
}