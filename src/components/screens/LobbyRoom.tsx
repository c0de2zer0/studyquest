'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import PixelAvatar from '@/components/PixelAvatar';
import { StoreState } from '@/store';

const MAP_W = 800;
const MAP_H = 600;
const WALL_THICKNESS = 40;
const PLAYER_SIZE = 48;
const SPEED = 3;
const FRAMES_PER_STEP = 7;
const WALK_FRAME_COUNT = 4;

interface MockLobbyPlayer {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  equippedItems: StoreState['user']['equippedItems'];
}

const EMPTY_ITEMS: StoreState['user']['equippedItems'] = {
  hat: null, top: null, bottom: null, shoes: null,
  hair: null, accessory: null, background: null,
};

const MOCK_PLAYERS: MockLobbyPlayer[] = [
  { id: 'mock-1', name: 'AstroKid', emoji: '🚀', x: 120, y: 150, equippedItems: EMPTY_ITEMS },
  { id: 'mock-2', name: 'NeonStar', emoji: '⭐', x: 600, y: 200, equippedItems: EMPTY_ITEMS },
  { id: 'mock-3', name: 'CyberX',   emoji: '⚡', x: 350, y: 450, equippedItems: EMPTY_ITEMS },
  { id: 'mock-4', name: 'PixelPro', emoji: '🎮', x: 680, y: 430, equippedItems: EMPTY_ITEMS },
  { id: 'mock-5', name: 'CodeWiz',  emoji: '🧙', x: 200, y: 380, equippedItems: EMPTY_ITEMS },
];

const RoomBackground = React.memo(function RoomBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `repeating-linear-gradient(
        0deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
      ), repeating-linear-gradient(
        90deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
      ), var(--s1)`,
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
      {/* Small table */}
      <div style={{
        position: 'absolute', left: 330, top: 80, width: 80, height: 50,
        background: 'rgba(34,211,238,.08)', border: '1px solid rgba(34,211,238,.2)', borderRadius: 4,
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
      <PixelAvatar equippedItems={player.equippedItems} size="lobby" direction="down" />
    </div>
  );
});

export function LobbyRoom({ onClose }: { onClose?: () => void }) {
  const user = useStore(state => state.user);

  const keysRef = useRef<Set<string>>(new Set());
  const posRef = useRef({ x: 200, y: 300 });

  const [playerPos, setPlayerPos] = useState({ x: 200, y: 300 });
  const [playerDir, setPlayerDir] = useState<'down' | 'left' | 'right' | 'up'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const frameCounterRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(1, window.innerWidth / MAP_W));
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

        frameCounterRef.current++;
        setFrameIndex(Math.floor(frameCounterRef.current / FRAMES_PER_STEP) % WALK_FRAME_COUNT);
      } else {
        frameCounterRef.current = 0;
        setFrameIndex(0);
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.85)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 20,
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 110,
          fontFamily: 'Space Mono', fontSize: 10,
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
          color: '#EF4444', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
        }}
      >
        Lobiden Çık
      </button>

      <div style={{
        width: MAP_W, height: MAP_H,
        position: 'relative', overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        flexShrink: 0,
      }}>
        <RoomBackground />

        {MOCK_PLAYERS.map(p => <MockPlayer key={p.id} player={p} />)}

        <div style={{ position: 'absolute', left: playerPos.x, top: playerPos.y }}>
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'Space Mono', fontSize: 8, color: '#22D3EE',
            whiteSpace: 'nowrap', marginBottom: 2,
          }}>
            {user.name}
          </div>
          <PixelAvatar
            equippedItems={user.equippedItems}
            size="lobby"
            direction={playerDir}
            isWalking={isWalking}
            frameIndex={frameIndex}
          />
        </div>
      </div>
    </div>
  );
}
