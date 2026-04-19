'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/feed');
        if (res.ok) {
          const data = await res.json();
          setFeed(data.feed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--secondary)', marginBottom: '2rem', textAlign: 'center' }}>Community Reels 🔥</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center' }}><span className="loader"></span></div>
      ) : feed.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No reels yet. Be the first to upload one!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {feed.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Video Player */}
              <div style={{ background: '#000', width: '100%', aspectRatio: '9/16', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video 
                  src={item.video_path} 
                  controls 
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              
              {/* Details */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>@{item.username}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                </h3>
                <p style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>{item.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,46,147,0.2)', color: 'var(--primary)', borderRadius: '10px' }}>{item.location}</span>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(8,247,254,0.2)', color: 'var(--secondary)', borderRadius: '10px' }}>Lvl {item.intensity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
