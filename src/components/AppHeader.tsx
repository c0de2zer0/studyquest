'use client';
import { useStore } from '@/store';
import { useState } from 'react';

export function AppHeader() {
  const { user, setActiveTab, unreadCount, markAllRead, notifications } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header style={{
      height: 56,
      background: 'rgba(7,8,15,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <button
        onClick={() => setActiveTab('dashboard')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <span style={{
          fontFamily: 'Orbitron',
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 3,
          background: 'linear-gradient(135deg, #7B5CF5, #22D3EE)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>STUDY●</span>
        <span style={{
          fontFamily: 'Orbitron',
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 3,
          color: '#F59E0B',
        }}>QUEST</span>
      </button>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Balance pill */}
        <div style={{
          background: 'rgba(245,158,11,.1)',
          border: '1px solid rgba(245,158,11,.25)',
          borderRadius: 20,
          padding: '5px 11px',
          fontFamily: 'Space Mono',
          fontSize: 11,
          color: '#F59E0B',
          whiteSpace: 'nowrap',
        }}>
          ⏱ {user.balance.toFixed(1)} sa
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, position: 'relative',
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--red)',
              }} />
            )}
          </button>
          {showNotifs && (
            <div style={{
              position: 'absolute', top: 38, right: 0,
              background: 'var(--s2)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10,
              width: 280,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid rgba(255,255,255,.04)',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  background: n.read ? 'transparent' : 'rgba(123,92,245,.05)',
                }}>
                  <span style={{ fontSize: 16 }}>{n.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)' }}>{n.text}</p>
                    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>{n.time}</span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--dim)' }}>
                  🔔 Tüm bildirimler okundu.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid #7B5CF5',
            background: 'rgba(123,92,245,.1)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 0 12px rgba(123,92,245,.3)',
            position: 'relative',
          }}
        >
          {user.emoji}
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#7B5CF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono', fontSize: 7, fontWeight: 700, color: 'white',
          }}>
            {user.level}
          </span>
        </button>
      </div>
    </header>
  );
}
