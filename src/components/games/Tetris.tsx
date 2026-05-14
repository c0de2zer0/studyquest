'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Pause, Play, Trophy, Layers, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// ---------- Types ----------

type CellValue = string | null;
type Board = CellValue[][];
type TetrominoKey = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Piece {
  shape: number[][];
  color: string;
  type: TetrominoKey;
}

interface Position {
  row: number;
  col: number;
}

interface GameState {
  board: Board;
  current: Piece | null;
  pos: Position;
  next: Piece | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
}

// ---------- Constants ----------

const COLS = 10;
const ROWS = 20;
const BASE_INTERVAL = 1000;
const MIN_INTERVAL = 100;
const INTERVAL_DECREASE = 50;
const LINES_PER_LEVEL = 10;

const TETROMINOES: Record<TetrominoKey, { shape: number[][]; color: string }> = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#06B6D4' },
  O: { shape: [[1, 1], [1, 1]], color: '#F59E0B' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#A78BFA' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#10B981' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#EF4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#3B82F6' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#F97316' },
};

const PIECE_KEYS: TetrominoKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const getBoxShadow = (color: string): string => {
  return `0 0 6px ${color}88, inset 0 0 4px ${color}44`;
};

// ---------- Helpers ----------

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece(): Piece {
  const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  const t = TETROMINOES[key];
  return { shape: t.shape.map((r) => [...r]), color: t.color, type: key };
}

function rotateCW(shape: number[][]): number[][] {
  const n = shape.length;
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => shape[n - 1 - c][r])
  );
}

function isValid(board: Board, shape: number[][], pos: Position): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardRow = pos.row + r;
      const boardCol = pos.col + c;
      if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) return false;
      if (board[boardRow][boardCol] !== null) return false;
    }
  }
  return true;
}

function mergePiece(board: Board, shape: number[][], pos: Position, color: string): Board {
  const next = board.map((r) => [...r]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        next[pos.row + r][pos.col + c] = color;
      }
    }
  }
  return next;
}

function clearLines(board: Board): { newBoard: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { newBoard: [...emptyRows, ...remaining], cleared };
}

function calcScore(linesCleared: number, level: number): number {
  const points = [0, 100, 300, 500, 800];
  return (points[Math.min(linesCleared, 4)] ?? 0) * level;
}

// ---------- Component ----------

interface TetrisProps {
  onBack: () => void;
}

export default function Tetris({ onBack }: TetrisProps) {
  const [state, setState] = useState<GameState>(() => {
    const first = randomPiece();
    const second = randomPiece();
    return {
      board: createBoard(),
      current: first,
      pos: { row: 0, col: Math.floor(COLS / 2) - Math.floor(first.shape[0].length / 2) },
      next: second,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      paused: false,
    };
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const intervalRef = useRef<number | null>(null);

  // Compute drop interval
  const dropInterval = Math.max(MIN_INTERVAL, BASE_INTERVAL - (state.level - 1) * INTERVAL_DECREASE);

  // Lock piece / spawn next
  const lockAndSpawn = useCallback(() => {
    setState((prev) => {
      if (!prev.current) return prev;
      const merged = mergePiece(prev.board, prev.current.shape, prev.pos, prev.current.color);
      const { newBoard, cleared } = clearLines(merged);
      const lineScore = calcScore(cleared, prev.level);
      const newLines = prev.lines + cleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const nextPiece = prev.next ?? randomPiece();
      const spawnPiece = { ...nextPiece, shape: nextPiece.shape.map((r) => [...r]) };
      const spawnCol = Math.floor(COLS / 2) - Math.floor(spawnPiece.shape[0].length / 2);

      // Game over check
      if (!isValid(newBoard, spawnPiece.shape, { row: 0, col: spawnCol })) {
        return {
          ...prev,
          board: newBoard,
          current: null,
          pos: { row: 0, col: 0 },
          score: prev.score + lineScore,
          lines: newLines,
          level: newLevel,
          gameOver: true,
          paused: false,
        };
      }

      return {
        ...prev,
        board: newBoard,
        current: spawnPiece,
        pos: { row: 0, col: spawnCol },
        next: randomPiece(),
        score: prev.score + lineScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  // Move piece
  const move = useCallback(
    (dr: number, dc: number) => {
      setState((prev) => {
        if (!prev.current || prev.gameOver || prev.paused) return prev;
        const newPos = { row: prev.pos.row + dr, col: prev.pos.col + dc };
        if (isValid(prev.board, prev.current.shape, newPos)) {
          return { ...prev, pos: newPos };
        }
        if (dr === 1) {
          // Piece can't move down -> lock
          // We defer locking to the next tick by returning prev and scheduling
          return prev;
        }
        return prev;
      });
    },
    []
  );

  // Hard drop
  const hardDrop = useCallback(() => {
    setState((prev) => {
      if (!prev.current || prev.gameOver || prev.paused) return prev;
      let newPos = { ...prev.pos };
      while (isValid(prev.board, prev.current.shape, { row: newPos.row + 1, col: newPos.col })) {
        newPos.row++;
      }
      // Lock piece at newPos
      const merged = mergePiece(prev.board, prev.current.shape, newPos, prev.current.color);
      const { newBoard, cleared } = clearLines(merged);
      const lineScore = calcScore(cleared, prev.level);
      const newLines = prev.lines + cleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const nextPiece = prev.next ?? randomPiece();
      const spawnPiece = { ...nextPiece, shape: nextPiece.shape.map((r) => [...r]) };
      const spawnCol = Math.floor(COLS / 2) - Math.floor(spawnPiece.shape[0].length / 2);
      const hardDropPoints = newPos.row - prev.pos.row;

      if (!isValid(newBoard, spawnPiece.shape, { row: 0, col: spawnCol })) {
        return {
          ...prev,
          board: newBoard,
          current: null,
          pos: newPos,
          score: prev.score + lineScore + hardDropPoints * 2,
          lines: newLines,
          level: newLevel,
          gameOver: true,
          paused: false,
        };
      }

      return {
        ...prev,
        board: newBoard,
        current: spawnPiece,
        pos: { row: 0, col: spawnCol },
        next: randomPiece(),
        score: prev.score + lineScore + hardDropPoints * 2,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  // Rotate
  const rotate = useCallback(() => {
    setState((prev) => {
      if (!prev.current || prev.gameOver || prev.paused) return prev;
      const rotated = rotateCW(prev.current.shape);
      if (isValid(prev.board, rotated, prev.pos)) {
        return {
          ...prev,
          current: { ...prev.current, shape: rotated },
        };
      }
      // Wall kick: try shifting left/right
      for (const kick of [-1, 1, -2, 2]) {
        const kicked = { row: prev.pos.row, col: prev.pos.col + kick };
        if (isValid(prev.board, rotated, kicked)) {
          return {
            ...prev,
            current: { ...prev.current, shape: rotated },
            pos: kicked,
          };
        }
      }
      return prev;
    });
  }, []);

  // Compute ghost position
  const ghostPos = (() => {
    if (!state.current || state.gameOver) return null;
    let ghostRow = state.pos.row;
    while (
      isValid(state.board, state.current.shape, { row: ghostRow + 1, col: state.pos.col })
    ) {
      ghostRow++;
    }
    return { row: ghostRow, col: state.pos.col };
  })();

  // Game tick
  useEffect(() => {
    if (state.gameOver || state.paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev.current || prev.gameOver || prev.paused) return prev;
        const newPos = { row: prev.pos.row + 1, col: prev.pos.col };
        if (isValid(prev.board, prev.current.shape, newPos)) {
          return { ...prev, pos: newPos };
        }
        // Lock piece
        const merged = mergePiece(prev.board, prev.current.shape, prev.pos, prev.current.color);
        const { newBoard, cleared } = clearLines(merged);
        const lineScore = calcScore(cleared, prev.level);
        const newLines = prev.lines + cleared;
        const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
        const nextPiece = prev.next ?? randomPiece();
        const spawnPiece = { ...nextPiece, shape: nextPiece.shape.map((r) => [...r]) };
        const spawnCol = Math.floor(COLS / 2) - Math.floor(spawnPiece.shape[0].length / 2);

        if (!isValid(newBoard, spawnPiece.shape, { row: 0, col: spawnCol })) {
          return {
            ...prev,
            board: newBoard,
            current: null,
            pos: { row: 0, col: 0 },
            score: prev.score + lineScore,
            lines: newLines,
            level: newLevel,
            gameOver: true,
          };
        }

        return {
          ...prev,
          board: newBoard,
          current: spawnPiece,
          pos: { row: 0, col: spawnCol },
          next: randomPiece(),
          score: prev.score + lineScore,
          lines: newLines,
          level: newLevel,
        };
      });
    }, dropInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dropInterval, state.gameOver, state.paused]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          move(0, -1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          move(0, 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          move(1, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'Escape':
          e.preventDefault();
          setState((p) => ({ ...p, paused: !p.paused }));
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, rotate, hardDrop]);

  // Reset game
  const resetGame = () => {
    const first = randomPiece();
    const second = randomPiece();
    setState({
      board: createBoard(),
      current: first,
      pos: { row: 0, col: Math.floor(COLS / 2) - Math.floor(first.shape[0].length / 2) },
      next: second,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      paused: false,
    });
  };

  // Render next piece preview
  const renderNextPiece = () => {
    if (!state.next) return null;
    const size = 20;
    return (
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${state.next.shape[0].length}, ${size}px)`,
        }}
      >
        {state.next.shape.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: size,
                height: size,
                backgroundColor: cell ? state.next!.color : 'transparent',
                borderRadius: 3,
                boxShadow: cell ? getBoxShadow(state.next!.color) : undefined,
              }}
            />
          ))
        )}
      </div>
    );
  };

  // Render a single cell
  const renderCell = (row: number, col: number, value: CellValue) => {
    const isGhost =
      ghostPos &&
      state.current &&
      row >= ghostPos.row &&
      row < ghostPos.row + state.current.shape.length &&
      col >= ghostPos.col &&
      col < ghostPos.col + state.current.shape[0].length &&
      state.current.shape[row - ghostPos.row]?.[col - ghostPos.col] &&
      (row !== state.pos.row + (row - ghostPos.row) || col !== state.pos.col + (col - ghostPos.col));

    const isActive =
      state.current &&
      row >= state.pos.row &&
      row < state.pos.row + state.current.shape.length &&
      col >= state.pos.col &&
      col < state.pos.col + state.current.shape[0].length &&
      state.current.shape[row - state.pos.row]?.[col - state.pos.col];

    const color = isActive
      ? state.current!.color
      : value;

    // Show ghost piece
    if (isGhost && color) {
      return (
        <div
          key={`${row}-${col}`}
          className="rounded-sm"
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${color}44`,
            opacity: 0.5,
          }}
        />
      );
    }

    return (
      <div
        key={`${row}-${col}`}
        className="rounded-sm transition-colors duration-75"
        style={{
          backgroundColor: color ?? 'transparent',
          boxShadow: color ? getBoxShadow(color) : undefined,
        }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
          Geri Dön
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={state.paused ? Play : Pause}
            onClick={() => setState((p) => ({ ...p, paused: !p.paused }))}
            disabled={state.gameOver}
          >
            {state.paused ? 'Devam' : 'Duraklat'}
          </Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetGame}>
            Yeni Oyun
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start justify-center">
        {/* Game Board */}
        <div className="relative">
          <div
            className="grid gap-px p-2 rounded-2xl border"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 26px)`,
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            {state.board.map((row, ri) =>
              row.map((cell, ci) => renderCell(ri, ci, cell))
            )}
          </div>

          {/* Pause overlay */}
          {state.paused && !state.gameOver && (
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-black/30">
              <div className="text-center">
                <Pause className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">Duraklatıldı</p>
                <p className="text-white/60 text-sm mt-1">Devam etmek için ESC</p>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {state.gameOver && (
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-black/40">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">Oyun Bitti</p>
                <p className="text-white/70 text-sm mt-1">
                  Skor: {state.score.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4 w-40">
          {/* Score */}
          <Card padding="sm" className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Skor
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {state.score.toLocaleString()}
            </p>
          </Card>

          {/* Level */}
          <Card padding="sm" className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Level
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {state.level}
            </p>
          </Card>

          {/* Lines */}
          <Card padding="sm" className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Satır
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {state.lines}
            </p>
          </Card>

          {/* Next Piece */}
          <Card padding="sm">
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Sıradaki
            </p>
            <div className="flex justify-center">{renderNextPiece()}</div>
          </Card>

          {/* Controls help */}
          <Card padding="sm">
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Kontroller
            </p>
            <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              <p>&larr; &rarr; Hareket</p>
              <p>&uarr; Döndür</p>
              <p>&darr; Yavaş düşüş</p>
              <p>Space Hızlı düşüş</p>
              <p>ESC Duraklat</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Game Over action buttons */}
      {state.gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4 mt-6"
        >
          <Button variant="primary" icon={RotateCcw} onClick={resetGame}>
            Yeni Oyun
          </Button>
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Geri Dön
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
