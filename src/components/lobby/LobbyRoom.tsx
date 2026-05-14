'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const MAP_W = 800;
const MAP_H = 600;
const WALL_THICKNESS = 40;
const PLAYER_SIZE = 48;
const SPEED = 3;

interface MockLobbyPlayer {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
}

const MOCK_PLAYERS: MockLobbyPlayer[] = [
  { id: 'mock-1', name: 'AstroKid', emoji: '🚀', x: 120, y: 150 },
  { id: 'mock-2', name: 'NeonStar', emoji: '⭐', x: 600, y: 200 },
  { id: 'mock-3', name: 'CyberX',   emoji: '⚡', x: 350, y: 450 },
  { id: 'mock-4', name: 'PixelPro', emoji: '🎮', x: 680, y: 430 },
  { id: 'mock-5', name: 'CodeWiz',  emoji: '🧙', x: 200, y: 380 },
];

// ─── Room Background ─────────────────────────────────────────────────────────

const RoomBackground = React.memo(function RoomBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `repeating-linear-gradient(
        0deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
      ), repeating-linear-gradient(
        90deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
      ), var(--bg)`,
    }}>
      {/* Walls */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: WALL_THICKNESS, background: 'var(--bg)', borderBottom: '2px solid rgba(123,92,245,.3)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: WALL_THICKNESS, background: 'var(--bg)', borderTop: '2px solid rgba(123,92,245,.3)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: WALL_THICKNESS, background: 'var(--bg)', borderRight: '2px solid rgba(123,92,245,.3)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: WALL_THICKNESS, background: 'var(--bg)', borderLeft: '2px solid rgba(123,92,245,.3)' }} />

      {/* Desk 1 */}
      <div style={{
        position: 'absolute', left: 100, top: 80, width: 120, height: 60,
        background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.3)', borderRadius: 4,
      }} />
      {/* Desk 2 */}
      <div style={{
        position: 'absolute', left: 560, top: 80, width: 140, height: 60,
        background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.3)', borderRadius: 4,
      }} />
      {/* Bookshelf */}
      <div style={{
        position: 'absolute', left: 550, top: 460, width: 180, height: 70,
        background: 'rgba(34,211,238,.1)', border: '1px solid rgba(34,211,238,.3)', borderRadius: 4,
      }} />

      {/* Room label */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Orbitron', fontSize: 10, color: 'rgba(123,92,245,.6)',
        letterSpacing: 3, whiteSpace: 'nowrap',
      }}>
        ÇALIŞMA ODASI
      </div>
    </div>
  );
});

// ─── Mock Player ─────────────────────────────────────────────────────────────

const MockPlayer = React.memo(function MockPlayer({ player }: { player: MockLobbyPlayer }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const baseX = player.x;
    const baseY = player.y;
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      const newX = Math.max(WALL_THICKNESS, Math.min(MAP_W - WALL_THICKNESS - PLAYER_SIZE, baseX + dx));
      const newY = Math.max(WALL_THICKNESS, Math.min(MAP_H - WALL_THICKNESS - PLAYER_SIZE, baseY + dy));
      containerRef.current.style.left = `${newX}px`;
      containerRef.current.style.top = `${newY}px`;
    }, 2500);
    return () => clearInterval(interval);
  }, [player.x, player.y]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', left: player.x, top: player.y }}>
      <div style={{
        position: 'absolute', bottom: '100%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)',
        whiteSpace: 'nowrap', marginBottom: 2,
      }}>
        {player.name}
      </div>
      <div style={{
        width: PLAYER_SIZE, height: PLAYER_SIZE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        {player.emoji}
      </div>
    </div>
  );
});

// ─── Main LobbyRoom ──────────────────────────────────────────────────────────

export default function LobbyRoom() {
  const router = useRouter();
  const user = useStore(state => state.user);

  const keysRef = useRef<Set<string>>(new Set());
  const posRef = useRef({ x: 200, y: 300 });

  const [playerPos, setPlayerPos] = useState({ x: 200, y: 300 });
  const [playerDir, setPlayerDir] = useState<'down' | 'left' | 'right' | 'up'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [scale, setScale] = useState(1);

  const rafRef = useRef<number>(0);
  const walkCycleRef = useRef(0);

  const handleLeave = useCallback(() => {
    router.push('/community');
  }, [router]);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(1, (window.innerWidth - 40) / MAP_W));
    };
    updateScale();
    window.addEventListener('resize', updateScale);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      const keys = keysRef.current;
      const dx =
        (keys.has('ArrowRight') || keys.has('d') || keys.has('D') ? SPEED : 0) -
        (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A') ? SPEED : 0);
      const dy =
        (keys.has('ArrowDown')  || keys.has('s') || keys.has('S') ? SPEED : 0) -
        (keys.has('ArrowUp')    || keys.has('w') || keys.has('W') ? SPEED : 0);

      const newX = Math.max(
        WALL_THICKNESS,
        Math.min(MAP_W - WALL_THICKNESS - PLAYER_SIZE, posRef.current.x + dx),
      );
      const newY = Math.max(
        WALL_THICKNESS,
        Math.min(MAP_H - WALL_THICKNESS - PLAYER_SIZE, posRef.current.y + dy),
      );
      posRef.current = { x: newX, y: newY };
      setPlayerPos({ x: newX, y: newY });

      const moving = dx !== 0 || dy !== 0;
      setIsWalking(moving);

      if (moving) {
        if (dx < 0) setPlayerDir('left');
        else if (dx > 0) setPlayerDir('right');
        else if (dy < 0) setPlayerDir('up');
        else setPlayerDir('down');
        walkCycleRef.current += 1;
      } else {
        walkCycleRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Walking animation pulse
  const walkPulse = isWalking
    ? 0.9 + 0.1 * Math.sin(walkCycleRef.current * 0.3)
    : 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Leave button */}
      <button
        onClick={handleLeave}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 110,
          fontFamily: 'Space Mono', fontSize: 10,
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
          color: '#EF4444', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
        }}
      >
        Lobiden Çık
      </button>

      {/* Controls info */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 110, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)',
          letterSpacing: 1,
        }}>
          WASD / Ok Tuşları ile Hareket Et
        </div>
      </div>

      {/* Map container */}
      <div style={{
        width: MAP_W, height: MAP_H,
        position: 'relative', overflow: 'hidden', borderRadius: 8,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        flexShrink: 0,
        boxShadow: '0 0 40px rgba(123,92,245,.15)',
      }}>
        <RoomBackground />

        {MOCK_PLAYERS.map(p => <MockPlayer key={p.id} player={p} />)}

        {/* User player */}
        <div style={{ position: 'absolute', left: playerPos.x, top: playerPos.y }}>
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'Space Mono', fontSize: 8, color: '#22D3EE',
            whiteSpace: 'nowrap', marginBottom: 2,
          }}>
            {user?.name || 'Sen'}
          </div>
          <div style={{
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            transform: `scale(${walkPulse})`,
            opacity: isWalking ? 0.85 : 1,
            transition: 'opacity 0.1s ease',
          }}>
            {user?.emoji || '🦊'}
          </div>
        </div>
      </div>
    </div>
  );
}
