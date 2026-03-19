'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { SUBJECTS } from '@/lib/constants';

export function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const createRoom = useStore(s => s.createRoom);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [canWrite, setCanWrite] = useState(true);
  const [canCompete, setCanCompete] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const subj = SUBJECTS.find(s => s.name === subject) ?? SUBJECTS[0];

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom({
      name: name.trim(), subject, subjectColor: subj.color, emoji: subj.emoji,
      ownerId: 'u1', ownerName: 'Shadow Fox', capacity: 10, isOpen,
      permissions: { canWrite, canCompete },
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111827', border: '1px solid rgba(123,92,245,.4)', borderRadius: 14,
        padding: 20, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: '#A78BFA' }}>+ Yeni Oda Kur</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Oda adı..."
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontFamily: 'Rajdhani', fontSize: 13, outline: 'none' }} />
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
          fontFamily: 'Space Mono', fontSize: 9 }}>
          {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}
        </select>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Üyeler ne yapabilir?</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '📝 Yazabilir', val: canWrite, set: setCanWrite },
            { label: '⚔️ Kapışabilir', val: canCompete, set: setCanCompete },
          ].map(({ label, val, set }) => (
            <button key={label} onClick={() => set(v => !v)} style={{
              flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 8,
              background: val ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${val ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
              color: val ? '#A78BFA' : 'var(--dim)',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ label: 'Açık Oda', val: true }, { label: 'Davetli', val: false }].map(opt => (
            <button key={opt.label} onClick={() => setIsOpen(opt.val)} style={{
              flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 8,
              background: isOpen === opt.val ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${isOpen === opt.val ? 'rgba(16,185,129,.4)' : 'rgba(255,255,255,.1)'}`,
              color: isOpen === opt.val ? '#10B981' : 'var(--dim)',
            }}>{opt.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: 8, cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)' }}>
            İptal
          </button>
          <button onClick={handleCreate} disabled={!name.trim()} style={{
            flex: 2, background: name.trim() ? 'rgba(123,92,245,.8)' : 'rgba(123,92,245,.3)',
            border: '1px solid #7B5CF5', borderRadius: 8, padding: 8, cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: '#fff' }}>
            ODA KUR
          </button>
        </div>
      </div>
    </div>
  );
}
