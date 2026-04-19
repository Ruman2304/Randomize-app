'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
      return;
    }

    if (user) {
      const fetchHistory = async () => {
        try {
          const res = await fetch('/api/tasks/history');
          if (res.ok) {
            const data = await res.json();
            setHistory(data.history);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user, authLoading, router]);

  if (authLoading) return null;

  return (
    <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', border: '1px solid var(--primary)' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>Welcome, {user?.username}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Here are your stats.</p>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '2.5rem' }}>✨ {user?.aura || 0}</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Aura</span>
        </div>
      </div>

      <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>My Mission History</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center' }}><span className="loader"></span></div>
      ) : history.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t completed any tasks yet. Get out there!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {history.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: item.status === 'failed' ? '4px solid var(--destructive)' : 'none' }}>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,46,147,0.2)', color: 'var(--primary)', borderRadius: '10px' }}>{item.location}</span>
                <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(8,247,254,0.2)', color: 'var(--secondary)', borderRadius: '10px' }}>Lvl {item.intensity}</span>
                {item.status === 'failed' ? (
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,0,0,0.2)', color: 'var(--destructive)', borderRadius: '10px', fontWeight: 'bold' }}>Chickened Out</span>
                ) : (
                  item.is_public === 1 && <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(245,211,0,0.2)', color: 'var(--tertiary)', borderRadius: '10px' }}>Public</span>
                )}
              </div>
              <p style={{ color: item.status === 'failed' ? 'var(--text-secondary)' : 'white', marginBottom: '1rem', fontWeight: '500', textDecoration: item.status === 'failed' ? 'line-through' : 'none' }}>{item.description}</p>
              {item.status !== 'failed' && (item.video_path ? (
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9' }}>
                  <video 
                    src={item.video_path} 
                    controls 
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No video proof uploaded
                </div>
              ))}
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
