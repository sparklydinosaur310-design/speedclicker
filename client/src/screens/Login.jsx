import { useState } from 'react';
import { supabase } from '../api/supabase.js';
import './Login.css';

export default function Login() {
    const [mode, setMode] = useState('login');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setBusy(true);

        const { error } =
        mode === 'signup'
        ? await supabase.auth.signUp ({
            email,
            password,
            options: { data: { username } },
        })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setBusy(false);
    }

    return (
        <div className="login">
            <h1 className="login-title">SPEEDCLICKER</h1>
            <form className="login-card" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                    <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    maxLength-={16}
                    required
                    />
                )}
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password (6+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                />
                {error && <p className="login-error">{error}</p>}
                <button type="submit" disabled={busy}>
                    {busy ? '...' : mode === 'signup' ? 'SIGN IN' : 'LOG IN'}
                </button>
                <button
                    type="button"
                    className="login-switch"
                    onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setError('');
                    }}
                    >
                        {mode === 'login' ? "Don't have an account? Sign in" : 'Already have an account? Log in'}
                    </button>
            </form>
        </div>
    );
}