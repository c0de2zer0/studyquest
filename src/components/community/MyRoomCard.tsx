'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

export function MyRoomCard() {
  const { myRoom, leaveCurrentRoom, sendRoomMessage, setActiveTab } = useStore(useShallow(s => ({
    myRoom: s.myRoom, leaveCurrentRoom: s.leaveCurrentRoom,
    sendRoomMessage: s.sendRoomMessage, setActiveTab: s.setActiveTab,
  })));
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');

  if (!myRoom) return null;

  const displayMembers = myRoom.members.slice(0, 4);
  const overflow = myRoom.members.length - 4;
  const lastMsgs = myRoom.messages.slice(-3);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'linear-gradient(135deg,#1A1040,#0F1A2E)',
      border: '1px solid #7B5CF5', borderRadius: 12, padding: 12, marginBottom: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, background: myRoom.subjectColor + '33',
          border: `2px solid ${myRoom.subjectColor}`, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {myRoom.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: '#A78BFA' }}>{myRoom.name}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
            {myRoom.ownerName}&apos;ın odası · <span style={{ color: '#10B981' }}>● Aktif</span>
          </div>
        </div>
        <button onClick={leaveCurrentRoom} style={{
          background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)',
          color: '#EF4444', padding: '4px 10px', borderRadius: 8,
          fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>ÇIKIŞ</button>
      </div>
      {/* Members + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        {displayMembers.map(m => (
          <div key={m.id} style={{ width: 24, height: 24, background: m.color + '33',
            border: `1.5px solid ${m.color}`, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{m.emoji}</div>
        ))}
        {overflow > 0 && (
          <div style={{ width: 24, height: 24, background: '#1E293B', border: '1.5px solid #374151',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono', fontSize: 7, color: '#64748B' }}>+{overflow}</div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {myRoom.permissions.canWrite && (
            <button onClick={() => setChatOpen(v => !v)} style={{
              background: chatOpen ? 'rgba(34,211,238,.3)' : 'rgba(34,211,238,.15)',
              border: '1px solid rgba(34,211,238,.4)', color: '#22D3EE',
              padding: '3px 8px', borderRadius: 6,
              fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>💬 Sohbet</button>
          )}
          {myRoom.permissions.canCompete && (
            <button onClick={() => setActiveTab('rando')} style={{
              background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.4)',
              color: '#A78BFA', padding: '3px 8px', borderRadius: 6,
              fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>⚔️ Kapış</button>
          )}
        </div>
      </div>
      {/* Inline chat */}
      {chatOpen && (
        <div style={{ background: '#0D1117', borderRadius: 8, padding: 8,
          border: '1px solid rgba(255,255,255,.07)',
          maxHeight: '45vh', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lastMsgs.map(m => (
              <div key={m.id} style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--dim)' }}>
                <span style={{ color: '#A78BFA' }}>{m.userEmoji} {m.userName}:</span> {m.content}
              </div>
            ))}
            {lastMsgs.length === 0 && (
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', textAlign: 'center' }}>
                Henüz mesaj yok. İlk sen yaz!
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && msg.trim()) { sendRoomMessage(msg); setMsg(''); } }}
              placeholder="Bir şey yaz..."
              style={{ flex: 1, background: '#1E293B', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 6, padding: '5px 8px', color: 'var(--text)',
                fontFamily: 'Rajdhani', fontSize: 11, outline: 'none' }} />
            <button onClick={() => { if (msg.trim()) { sendRoomMessage(msg); setMsg(''); } }} style={{
              background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 9 }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
