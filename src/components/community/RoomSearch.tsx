'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

export function RoomSearch({ onCreateClick }: { onCreateClick: () => void }) {
  const [query, setQuery] = useState('');
  const { rooms, myRoom, joinRoomById } = useStore(useShallow(s => ({
    rooms: s.rooms, myRoom: s.myRoom, joinRoomById: s.joinRoomById,
  })));

  const filtered = rooms.filter(r =>
    !query || r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Oda ara... (Matematik, Fizik, YKS...)"
          style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontFamily: 'Rajdhani', fontSize: 12, outline: 'none' }}
        />
        <button onClick={onCreateClick} style={{
          background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
          padding: '8px 14px', borderRadius: 8,
          fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>+ Oda Kur</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
        {filtered.map(room => {
          const isFull = room.members.length >= room.capacity;
          const isMyRoom = myRoom?.id === room.id;
          return (
            <div key={room.id} style={{
              background: '#111827', border: `1px solid ${room.subjectColor}44`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, background: room.subjectColor + '33',
                  border: `2px solid ${room.subjectColor}`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {room.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: room.subjectColor }}>{room.name}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
                    {room.ownerName}&apos;ın odası · {room.isOpen ? 'Açık' : 'Davetli'}
                  </div>
                </div>
                <div style={{
                  background: isFull ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
                  border: `1px solid ${isFull ? 'rgba(239,68,68,.4)' : 'rgba(16,185,129,.4)'}`,
                  color: isFull ? '#EF4444' : '#10B981',
                  padding: '2px 8px', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 8,
                }}>{isFull ? 'Dolu ' : ''}{room.members.length}/{room.capacity}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {room.permissions.canWrite && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#94A3B8' }}>📝 Yazabilirsin</span>}
                {room.permissions.canCompete && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#94A3B8' }}>⚔️ Kapışabilirsin</span>}
                {!room.permissions.canWrite && !room.permissions.canCompete && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#EF4444' }}>🔒 Sadece izle</span>}
              </div>
              <button
                disabled={isFull || isMyRoom}
                onClick={() => joinRoomById(room.id)}
                style={{
                  width: '100%', padding: '5px 0', borderRadius: 6,
                  cursor: isFull || isMyRoom ? 'default' : 'pointer',
                  fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700,
                  background: isMyRoom ? 'rgba(16,185,129,.15)' : isFull ? 'rgba(255,255,255,.05)' : 'rgba(123,92,245,.8)',
                  border: isMyRoom ? '1px solid rgba(16,185,129,.4)' : isFull ? '1px solid rgba(255,255,255,.1)' : '1px solid #7B5CF5',
                  color: isMyRoom ? '#10B981' : isFull ? '#64748B' : '#fff',
                }}>
                {isMyRoom ? '✓ Bu Odadasın' : isFull ? 'Dolu' : 'ODAYA GİR'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
