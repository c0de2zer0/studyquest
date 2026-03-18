'use client';
import { useStore } from '@/store';
import { useState } from 'react';

export function XPStrip() {
  const { user } = useStore();
  const pct = (user.xp / user.xpMax) * 100;
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      style={{ height: 3, background: 'rgba(255,255,255,.06)', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #5340C9, #7B5CF5, #22D3EE)',
        transition: 'width .5s ease',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', right: -4.5, top: -3,
          width: 9, height: 9, borderRadius: '50%',
          background: '#22D3EE',
          boxShadow: '0 0 8px #22D3EE',
        }} />
      </div>
      {showTip && (
        <div style={{
          position: 'absolute', bottom: 10, left: `${pct}%`,
          transform: 'translateX(-50%)',
          background: 'var(--s3)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 6, padding: '4px 8px',
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--text)',
          whiteSpace: 'nowrap', zIndex: 50,
          pointerEvents: 'none',
        }}>
          LV.{user.level} · {user.xp}/{user.xpMax} XP · {user.xpMax - user.xp} XP sonraki seviye
        </div>
      )}
    </div>
  );
}
