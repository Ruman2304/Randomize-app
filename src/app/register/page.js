'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '400px', margin: '0 auto', marginTop: '10vh' }}>
      <div className="glass-card">
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Register</h1>
        {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Choose a cool username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ background: 'linear-gradient(135deg, var(--secondary), #00A676)' }}>
            {isLoading ? <span className="loader"></span> : 'Join the Chaos'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Already signed up? <Link href="/login" style={{ color: 'var(--secondary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
