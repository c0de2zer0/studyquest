'use client';
import { useStore } from '@/store';
import { useRef, useEffect } from 'react';
import { TABS } from '@/lib/constants';

export function TabBar() {
  const { activeTab, setActiveTab } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  return (
    <div style={{
      background: 'rgba(13,14,26,.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,.05)',
      position: 'sticky',
      top: 56,
      zIndex: 90,
      overflowX: 'auto',
      display: 'flex',
    }} className="no-scrollbar" ref={scrollRef}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : null}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: 'Orbitron',
              fontSize: '7.5px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              padding: '10px 12px',
              whiteSpace: 'nowrap',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? '#22D3EE' : '#64748B',
              borderBottom: isActive ? '2px solid #22D3EE' : '2px solid transparent',
              position: 'relative',
              transition: 'color .15s, border-color .15s',
              flexShrink: 0,
            }}
          >
            {tab.label}
            {isActive && (
              <span style={{
                position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                width: 20, height: 1,
                boxShadow: '0 0 6px #22D3EE',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
