'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Flame, Compass, History, LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        RANDOMIZE
      </Link>
      <div className="navbar-links">
        {loading ? null : user ? (
          <>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', color: 'var(--tertiary)' }}>
              ✨ Aura: {user.aura || 0}
            </div>
            <Link href="/" title="Dashboard"><Compass size={24} /></Link>
            <Link href="/feed" title="Community Reels"><Flame size={24} color="#FF2E93" /></Link>
            <Link href="/history" title="My History"><History size={24} /></Link>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem', width: 'auto', border: 'none' }} title="Logout">
              <LogOut size={24} />
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogIn size={20} /> Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
