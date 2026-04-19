'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [location, setLocation] = useState('home');
  const [intensity, setIntensity] = useState(1);
  const [task, setTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        // Simple mapping based on OSM categories
        const amenity = data.address?.amenity || data.address?.leisure || '';
        let mappedLoc = 'public';
        
        if (['university', 'college', 'school', 'library'].includes(amenity)) mappedLoc = 'university';
        else if (['park', 'garden', 'nature_reserve'].includes(amenity)) mappedLoc = 'park';
        else if (['gym', 'sports_centre'].includes(amenity)) mappedLoc = 'gym';
        else if (data.address?.residential || data.address?.house) mappedLoc = 'home';
        
        setLocation(mappedLoc);
      } catch (err) {
        console.error(err);
        setLocation('public');
      } finally {
        setLocLoading(false);
      }
    }, () => {
      setLocLoading(false);
      setLocation('public');
    });
  };

  if (loading) return null;
  if (!user) return null;

  const getTask = async () => {
    setIsLoadingTask(true);
    setTask(null);
    setSuccess(false);
    setVideoFile(null);
    try {
      const res = await fetch(`/api/tasks/suggest?location=${encodeURIComponent(location)}&intensity=${intensity}`);
      const data = await res.json();
      if (res.ok) {
        setTask(data.task);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTask(false);
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('taskId', task.id);
    formData.append('isPublic', isPublic);
    if (task.id === 'generic') {
      formData.append('location', task.location);
      formData.append('intensity', task.intensity);
      formData.append('description', task.description);
    }
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        body: formData, // fetch handles multipart automatically
      });
      if (res.ok) {
        setSuccess(true);
        refreshUser();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to complete task');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {!task && !isLoadingTask && (
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Boredom Killer</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Where are you and how crazy are we getting today?
          </p>
          
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Location</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. university, park, public, home"
                list="locations"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button onClick={handleGetCurrentLocation} className="btn-secondary" style={{ width: 'auto', padding: '0 1rem' }} disabled={locLoading}>
                {locLoading ? '...' : '📍 Auto'}
              </button>
            </div>
            <datalist id="locations">
              <option value="university" />
              <option value="park" />
              <option value="home" />
              <option value="gym" />
              <option value="public" />
            </datalist>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Intensity Level: <span style={{ color: 'var(--tertiary)' }}>{intensity}</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={intensity} 
              onChange={(e) => setIntensity(e.target.value)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <span>Relaxed</span>
              <span>Chaotic</span>
            </div>
          </div>

          <button onClick={getTask} className="btn-primary">
            Give me a task!
          </button>
        </div>
      )}

      {isLoadingTask && (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <span className="loader" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--secondary)' }}>Generating chaos...</p>
        </div>
      )}

      {task && !success && (
        <div className="glass-card animate-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: task.quest_type === 'boss' ? '#F5D300' : task.quest_type === 'main' ? '#FF2E93' : '#08F7FE' }}>
              <ShieldAlert size={24} />
              <h2 style={{ margin: 0 }}>
                {task.quest_type === 'boss' ? '👑 Boss Move' : task.quest_type === 'main' ? '🎯 Main Quest' : '⚡ Side Quest'}
              </h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: 'bold' }}>
              +{task.aura_reward || 10} Aura
            </div>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: `4px solid ${task.quest_type === 'boss' ? '#F5D300' : 'var(--primary)'}` }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{task.description}</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,46,147,0.2)', borderRadius: '20px', color: 'var(--primary)', textTransform: 'capitalize' }}>📍 {task.location}</span>
              <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(8,247,254,0.2)', borderRadius: '20px', color: 'var(--secondary)' }}>🔥 Lvl {task.intensity}</span>
            </div>
          </div>

          <form onSubmit={handleCompleteTask}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Proof (Optional)</label>
              <div style={{ 
                border: '2px dashed var(--surface-border)', 
                padding: '2rem', 
                borderRadius: '12px', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: videoFile ? 'rgba(8,247,254,0.1)' : 'transparent'
              }}>
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={32} color={videoFile ? 'var(--secondary)' : 'var(--text-secondary)'} />
                  <span>{videoFile ? videoFile.name : 'Upload Video to IG Reels style Feed'}</span>
                  <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => setVideoFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {videoFile && (
              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="publicToggle"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                <label htmlFor="publicToggle" style={{ cursor: 'pointer' }}>Make this video public on Community Reels 🔥</label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setTask(null)} className="btn-secondary">
                Chicken Out
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {isSubmitting ? <span className="loader"></span> : <><CheckCircle2 /> Mark as Done</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <div className="glass-card animate-in" style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <CheckCircle2 size={48} color="white" />
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Legendary!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You survived the chaos.</p>
          <div style={{ background: 'rgba(245, 211, 0, 0.1)', border: '1px solid var(--tertiary)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--tertiary)' }}>+ {task?.aura_reward || 10} Aura Earned ✨</span>
          </div>
          <br/>
          <button onClick={() => { setTask(null); setSuccess(false); }} className="btn-primary">
            Another one!
          </button>
        </div>
      )}
    </div>
  );
}
