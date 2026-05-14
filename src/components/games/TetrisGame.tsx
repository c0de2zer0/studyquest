'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';

// ─── Types ──────────────────────────────────────────────────────────────

type TetrominoKey = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type Board = (string | null)[][];
type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
type RotationState = 0 | 1 | 2 | 3;

interface Piece {
  type: TetrominoKey;
  shape: number[][];
  color: string;
}

interface Position {
  row: number;
  col: number;
}

interface GameData {
  board: Board;
  current: Piece | null;
  pos: Position;
  rotationIndex: RotationState;
  ghostPos: Position | null;
  nextQueue: TetrominoKey[];
  bag: TetrominoKey[];
  holdPiece: TetrominoKey | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  piecesCount: number;
  combo: number;
  backToBack: boolean;
  gameState: GameState;
  lastKickWasRotation: boolean;
  tspin: boolean;
  clearedLines: number[];
  lockResets: number;
  isOnSurface: boolean;
  startTime: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  dist: number;
  size: number;
}

// ─── Constants ──────────────────────────────────────────────────────────

const COLS = 10;
const VISIBLE_ROWS = 20;
const HIDDEN_ROWS = 2;
const TOTAL_ROWS = VISIBLE_ROWS + HIDDEN_ROWS;
const CELL = 28;

const DAS_DELAY = 167;
const DAS_REPEAT = 33;
const LOCK_DELAY = 500;
const MAX_LOCK_RESETS = 15;

const COLORS: Record<TetrominoKey, string> = {
  I: '#00f0ff',
  O: '#ffd700',
  T: '#8b5cf6',
  S: '#10b981',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

const PIECE_KEYS: TetrominoKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const PARTICLE_COLORS = ['#00f0ff', '#ffd700', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#f97316', '#ffffff'];

const SHAPES: Record<TetrominoKey, number[][][]> = {
  I: [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  O: [
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
  ],
  T: [
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]],
  ],
  S: [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,0,0],[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,0],[0,1,0]],
  ],
  Z: [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,0],[1,0,0]],
  ],
  J: [
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]],
    [[0,0,0],[1,1,1],[0,0,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
  ],
  L: [
    [[0,0,1],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
  ],
};

// SRS wall kick data: [col_offset, row_offset] in (x, y-up) convention
// Applied as: newPos.col += kick[0], newPos.row -= kick[1]

type KickTable = Record<string, [number, number][]>;

const JLSTZ_KICKS: KickTable = {
  '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
};

const I_KICKS: KickTable = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
};

const PARTICLE_COLORS_MAP = ['#00f0ff', '#ffd700', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#f97316', '#ffffff88'];

// ─── Helpers ────────────────────────────────────────────────────────────

function createBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
}

function shuffleBag(): TetrominoKey[] {
  const arr = [...PIECE_KEYS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getPiece(type: TetrominoKey, rotation: RotationState): Piece {
  return {
    type,
    shape: SHAPES[type][rotation].map(r => [...r]),
    color: COLORS[type],
  };
}

function getShape(type: TetrominoKey, rotation: RotationState): number[][] {
  return SHAPES[type][rotation].map(r => [...r]);
}

function isValid(board: Board, shape: number[][], pos: Position): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const boardRow = pos.row + r;
      const boardCol = pos.col + c;
      if (boardCol < 0 || boardCol >= COLS || boardRow >= TOTAL_ROWS) return false;
      if (boardRow < 0) continue;
      if (board[boardRow][boardCol] !== null) return false;
    }
  }
  return true;
}

function mergePiece(board: Board, shape: number[][], pos: Position, color: string): Board {
  const next = board.map(r => [...r]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const row = pos.row + r;
        const col = pos.col + c;
        if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS) {
          next[row][col] = color;
        }
      }
    }
  }
  return next;
}

function clearLines(board: Board): { newBoard: Board; cleared: number; indices: number[] } {
  const indices: number[] = [];
  const remaining = board.filter((row, idx) => {
    const full = row.every(c => c !== null);
    if (full) indices.push(idx);
    return !full;
  });
  const cleared = indices.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { newBoard: [...empty, ...remaining], cleared, indices };
}

function getGhostPos(board: Board, shape: number[][], pos: Position): Position {
  let row = pos.row;
  while (isValid(board, shape, { row: row + 1, col: pos.col })) {
    row++;
  }
  return { row, col: pos.col };
}

function getGravityMs(level: number): number {
  if (level >= 30) return 17;
  if (level >= 25) return 33;
  if (level >= 20) return 50;
  if (level >= 15) return 100;
  if (level >= 10) return 200;
  if (level >= 5) return 500;
  return 1000;
}

function detectTSpin(board: Board, piece: Piece, pos: Position, lastMoveWasRotation: boolean): boolean {
  if (piece.type !== 'T' || !lastMoveWasRotation) return false;
  const corners = [
    [pos.row, pos.col],
    [pos.row, pos.col + 2],
    [pos.row + 2, pos.col],
    [pos.row + 2, pos.col + 2],
  ];
  let count = 0;
  for (const [r, c] of corners) {
    if (r < 0 || r >= TOTAL_ROWS || c < 0 || c >= COLS || board[r][c] !== null) {
      count++;
    }
  }
  return count >= 3;
}

function getLineClearScore(cleared: number, level: number, tspin: boolean, tspinMini: boolean): number {
  if (tspin) {
    if (cleared === 0) return 100 * level; // T-Spin Mini 0 lines
    if (cleared === 1) return 800 * level;
    if (cleared === 2) return 1200 * level;
    if (cleared === 3) return 1600 * level;
  }
  const points = [0, 100, 300, 500, 800];
  return (points[Math.min(cleared, 4)] ?? 0) * level;
}

function spawnPosition(type: TetrominoKey): number {
  const shape = SHAPES[type][0];
  return Math.floor((COLS - shape[0].length) / 2);
}

function nextFromBag(bag: TetrominoKey[]): { type: TetrominoKey; bag: TetrominoKey[] } {
  const b = [...bag];
  if (b.length === 0) {
    const nb = shuffleBag();
    return { type: nb[0], bag: nb.slice(1) };
  }
  return { type: b[0], bag: b.slice(1) };
}

function fillQueue(queue: TetrominoKey[], bag: TetrominoKey[]): { queue: TetrominoKey[]; bag: TetrominoKey[] } {
  let q = [...queue];
  let b = [...bag];
  while (q.length < 7) {
    if (b.length === 0) b = shuffleBag();
    q.push(b[0]);
    b = b.slice(1);
  }
  return { queue: q, bag: b };
}

// ─── Component ──────────────────────────────────────────────────────────

interface TetrisGameProps {
  onBack: () => void;
}

export default function TetrisGame({ onBack }: TetrisGameProps) {
  const saveTetrisScore = useStore((s) => s.saveTetrisScore);
  const highScoreRef = useRef(useStore.getState().tetrisHighScore);

  // ── Mutable game state ref ──
  const gRef = useRef<GameData>(createInitialGame());
  const [, setTick] = useState(0);
  const render = useCallback(() => setTick(t => t + 1), []);

  // ── Animation refs ──
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const gravAccumRef = useRef(0);
  const lockAccumRef = useRef(0);
  const scoreSavedRef = useRef(false);

  // ── DAS refs ──
  const keysDown = useRef(new Set<string>());
  const dasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dasRepeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dasDirRef = useRef<string | null>(null);

  // ── Effects state ──
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);

  // ── Create initial game ──
  function createInitialGame(): GameData {
    const bag1 = shuffleBag();
    const bag2 = shuffleBag();
    const queue = [bag1[0], bag1[1], bag1[2], bag1[3], bag1[4], bag1[5], bag1[6]];
    const firstType = queue[0];
    const remaining = queue.slice(1);
    return {
      board: createBoard(),
      current: getPiece(firstType, 0),
      pos: { row: 1, col: spawnPosition(firstType) },
      rotationIndex: 0,
      ghostPos: null,
      nextQueue: remaining,
      bag: bag2,
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      piecesCount: 0,
      combo: -1,
      backToBack: false,
      gameState: 'menu',
      lastKickWasRotation: false,
      tspin: false,
      clearedLines: [],
      lockResets: 0,
      isOnSurface: false,
      startTime: 0,
    };
  }

  // ── Spawn next piece ──
  const spawnNext = useCallback(() => {
    const g = gRef.current;
    const nq = [...g.nextQueue];
    let b = [...g.bag];
    const type = nq.shift()!;
    while (nq.length < 7) {
      if (b.length === 0) b = shuffleBag();
      nq.push(b[0]);
      b = b.slice(1);
    }
    const shape = SHAPES[type][0];
    const col = Math.floor((COLS - shape[0].length) / 2);
    const piece = getPiece(type, 0);
    const ghost = getGhostPos(g.board, shape, { row: 1, col });

    g.current = piece;
    g.pos = { row: 1, col };
    g.rotationIndex = 0;
    g.ghostPos = ghost;
    g.nextQueue = nq;
    g.bag = b;
    g.canHold = true;
    g.piecesCount++;
    g.lockResets = 0;
    g.isOnSurface = false;
    g.lastKickWasRotation = false;
    g.tspin = false;
    gravAccumRef.current = 0;
    lockAccumRef.current = 0;

    // Check game over
    if (!isValid(g.board, shape, { row: 1, col })) {
      g.current = null;
      g.gameState = 'gameover';
    }
  }, []);

  // ── Lock piece ──
  const lockPiece = useCallback(() => {
    const g = gRef.current;
    if (!g.current) return;
    const merged = mergePiece(g.board, g.current.shape, g.pos, g.current.color);
    const isTspin = detectTSpin(g.board, g.current, g.pos, g.lastKickWasRotation);
    g.tspin = isTspin;
    const { newBoard, cleared, indices } = clearLines(merged);
    const wasBTB = g.backToBack;
    const isDifficult = isTspin || cleared >= 4;
    let score = 0;

    if (cleared > 0) {
      const tspinMini = isTspin && cleared === 0;
      score = getLineClearScore(cleared, g.level, isTspin, tspinMini);
      if (isDifficult && wasBTB) {
        score = Math.floor(score * 1.5);
      }
      g.backToBack = isDifficult;
      g.combo++;
      if (g.combo > 0) {
        score += 50 * g.combo * g.level;
      }
      g.lines += cleared;
      const newLevel = Math.floor(g.lines / 10) + 1;
      if (newLevel > g.level) {
        g.level = newLevel;
      }
      g.clearedLines = indices;

      // Effects
      setClearingRows(indices.map(i => i - HIDDEN_ROWS));
      setParticles(generateParticles(indices));
      if (cleared >= 4) {
        setScreenFlash(true);
        setTimeout(() => setScreenFlash(false), 200);
      }
      setTimeout(() => {
        setClearingRows([]);
        setParticles([]);
        setFlashActive(false);
      }, 500);
      setFlashActive(true);
    } else {
      g.combo = -1;
    }

    g.board = newBoard;
    g.score += score;
    g.current = null;

    // Spawn next
    spawnNext();

    // If game over, save score
    if (g.gameState === 'gameover' && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      gRef.current.startTime = g.startTime;
    }
  }, [spawnNext]);

  // ── Move ──
  const movePiece = useCallback((dc: number) => {
    const g = gRef.current;
    if (!g.current || g.gameState !== 'playing') return false;
    const newPos = { row: g.pos.row, col: g.pos.col + dc };
    if (isValid(g.board, g.current.shape, newPos)) {
      g.pos = newPos;
      g.ghostPos = getGhostPos(g.board, g.current.shape, g.pos);
      g.lastKickWasRotation = false;
      // Reset lock delay on successful move while on surface
      if (g.isOnSurface && g.lockResets < MAX_LOCK_RESETS) {
        lockAccumRef.current = 0;
        g.lockResets++;
      }
      return true;
    }
    return false;
  }, []);

  // ── Soft drop ──
  const softDrop = useCallback(() => {
    const g = gRef.current;
    if (!g.current || g.gameState !== 'playing') return false;
    const newPos = { row: g.pos.row + 1, col: g.pos.col };
    if (isValid(g.board, g.current.shape, newPos)) {
      g.pos = newPos;
      g.ghostPos = getGhostPos(g.board, g.current.shape, g.pos);
      g.score += 1;
      g.isOnSurface = false;
      gravAccumRef.current = 0;
      lockAccumRef.current = 0;
      return true;
    }
    return false;
  }, []);

  // ── Hard drop ──
  const hardDrop = useCallback(() => {
    const g = gRef.current;
    if (!g.current || g.gameState !== 'playing') return;
    let dropDist = 0;
    while (isValid(g.board, g.current.shape, { row: g.pos.row + 1, col: g.pos.col })) {
      g.pos.row++;
      dropDist++;
    }
    g.score += dropDist * 2;
    lockAccumRef.current = LOCK_DELAY; // Force lock
  }, []);

  // ── Rotate ──
  const rotatePiece = useCallback((clockwise: boolean) => {
    const g = gRef.current;
    if (!g.current || g.gameState !== 'playing') return;
    const oldR = g.rotationIndex;
    const newR = clockwise
      ? ((oldR + 1) % 4) as RotationState
      : ((oldR + 3) % 4) as RotationState;
    const newShape = getShape(g.current.type, newR);
    const key = clockwise ? `${oldR}>${newR}` : `${oldR}>${newR}`;
    const kicks = g.current.type === 'I' ? I_KICKS : g.current.type === 'O' ? null : JLSTZ_KICKS;

    // Try basic rotation
    if (isValid(g.board, newShape, g.pos)) {
      g.current.shape = newShape;
      g.rotationIndex = newR;
      g.ghostPos = getGhostPos(g.board, newShape, g.pos);
      g.lastKickWasRotation = true;
      if (g.isOnSurface && g.lockResets < MAX_LOCK_RESETS) {
        lockAccumRef.current = 0;
        g.lockResets++;
      }
      return;
    }

    // Try wall kicks
    if (kicks && kicks[key]) {
      for (const kick of kicks[key]) {
        const kickedPos = { row: g.pos.row - kick[1], col: g.pos.col + kick[0] };
        if (isValid(g.board, newShape, kickedPos)) {
          g.current.shape = newShape;
          g.rotationIndex = newR;
          g.pos = kickedPos;
          g.ghostPos = getGhostPos(g.board, newShape, g.pos);
          g.lastKickWasRotation = true;
          if (g.isOnSurface && g.lockResets < MAX_LOCK_RESETS) {
            lockAccumRef.current = 0;
            g.lockResets++;
          }
          return;
        }
      }
    }
  }, []);

  // ── Hold ──
  const holdPiece = useCallback(() => {
    const g = gRef.current;
    if (!g.current || !g.canHold || g.gameState !== 'playing') return;
    const currentType = g.current.type;
    if (g.holdPiece) {
      const swapType = g.holdPiece;
      g.holdPiece = currentType;
      const shape = SHAPES[swapType][0];
      const col = Math.floor((COLS - shape[0].length) / 2);
      g.current = getPiece(swapType, 0);
      g.pos = { row: 1, col };
      g.rotationIndex = 0;
      g.ghostPos = getGhostPos(g.board, shape, { row: 1, col });
    } else {
      g.holdPiece = currentType;
      spawnNext();
    }
    g.canHold = false;
    g.lockResets = 0;
    g.isOnSurface = false;
    gravAccumRef.current = 0;
    lockAccumRef.current = 0;
  }, [spawnNext]);

  // ── DAS handling ──
  const clearDAS = useCallback(() => {
    if (dasTimerRef.current) { clearTimeout(dasTimerRef.current); dasTimerRef.current = null; }
    if (dasRepeatRef.current) { clearInterval(dasRepeatRef.current); dasRepeatRef.current = null; }
    dasDirRef.current = null;
  }, []);

  const startDAS = useCallback((dir: string) => {
    clearDAS();
    dasDirRef.current = dir;
    dasTimerRef.current = setTimeout(() => {
      dasRepeatRef.current = setInterval(() => {
        if (dasDirRef.current === 'left') movePiece(-1);
        else if (dasDirRef.current === 'right') movePiece(1);
        render();
      }, DAS_REPEAT);
    }, DAS_DELAY);
  }, [clearDAS, movePiece, render]);

  // ── Keyboard ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gRef.current;
      keysDown.current.add(e.key);

      // Menu state
      if (g.gameState === 'menu') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const fresh = createInitialGame();
          fresh.gameState = 'playing';
          fresh.startTime = Date.now();
          gRef.current = fresh;
          scoreSavedRef.current = false;
          gravAccumRef.current = 0;
          lockAccumRef.current = 0;
          lastTimeRef.current = 0;
          render();
        }
        return;
      }

      // Game over state
      if (g.gameState === 'gameover') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const fresh = createInitialGame();
          fresh.gameState = 'playing';
          fresh.startTime = Date.now();
          gRef.current = fresh;
          scoreSavedRef.current = false;
          gravAccumRef.current = 0;
          lockAccumRef.current = 0;
          lastTimeRef.current = 0;
          render();
        }
        return;
      }

      // Paused state
      if (g.gameState === 'paused') {
        if (e.key === 'Escape') {
          e.preventDefault();
          g.gameState = 'playing';
          lastTimeRef.current = 0;
          render();
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const fresh = createInitialGame();
          fresh.gameState = 'playing';
          fresh.startTime = Date.now();
          gRef.current = fresh;
          scoreSavedRef.current = false;
          gravAccumRef.current = 0;
          lockAccumRef.current = 0;
          lastTimeRef.current = 0;
          render();
        }
        return;
      }

      // Playing state
      if (g.gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (dasDirRef.current !== 'left') {
            movePiece(-1);
            render();
            startDAS('left');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (dasDirRef.current !== 'right') {
            movePiece(1);
            render();
            startDAS('right');
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          render();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault();
          rotatePiece(true);
          render();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotatePiece(false);
          render();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          render();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          holdPiece();
          render();
          break;
        case 'Escape':
          e.preventDefault();
          g.gameState = 'paused';
          render();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
      if ((e.key === 'ArrowLeft' && dasDirRef.current === 'left') ||
          (e.key === 'ArrowRight' && dasDirRef.current === 'right')) {
        clearDAS();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearDAS();
    };
  }, [movePiece, softDrop, hardDrop, rotatePiece, holdPiece, render, clearDAS, startDAS]);

  // ── Game loop (rAF) ──
  useEffect(() => {
    const loop = (timestamp: number) => {
      const g = gRef.current;
      if (g.gameState !== 'playing') {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 100);
      lastTimeRef.current = timestamp;

      if (!g.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const shape = g.current.shape;

      // Check if on surface
      const onSurface = !isValid(g.board, shape, { row: g.pos.row + 1, col: g.pos.col });
      if (onSurface) {
        if (!g.isOnSurface) {
          g.isOnSurface = true;
          lockAccumRef.current = 0;
        } else {
          lockAccumRef.current += dt;
        }
        g.ghostPos = getGhostPos(g.board, shape, g.pos);
      } else {
        g.isOnSurface = false;
        lockAccumRef.current = 0;
        // Gravity
        gravAccumRef.current += dt;
        const gravMs = getGravityMs(g.level);
        if (gravMs > 0 && gravAccumRef.current >= gravMs) {
          gravAccumRef.current = 0;
          const newPos = { row: g.pos.row + 1, col: g.pos.col };
          if (isValid(g.board, shape, newPos)) {
            g.pos = newPos;
            g.ghostPos = getGhostPos(g.board, g.current.shape, g.pos);
          }
        } else if (gravMs === 0) {
          // Level 30+ instant drop
          g.pos.row++;
          g.ghostPos = getGhostPos(g.board, g.current.shape, g.pos);
        }
      }

      // Lock delay check
      if (g.isOnSurface && lockAccumRef.current >= LOCK_DELAY) {
        lockPiece();
        render();
      } else if (g.isOnSurface && g.lockResets >= MAX_LOCK_RESETS) {
        lockPiece();
        render();
      }

      // Save score on game over
      // Re-read from ref since lockPiece() may have changed gameState
      const gAfterLock = gRef.current;
      if (gAfterLock.gameState === 'gameover' && !scoreSavedRef.current) {
        scoreSavedRef.current = true;
        gAfterLock.startTime = gAfterLock.startTime || Date.now();
        const elapsed = Math.floor((Date.now() - gAfterLock.startTime) / 1000);
        saveTetrisScore(gAfterLock.score, gAfterLock.lines, elapsed);
        render();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [lockPiece, render, saveTetrisScore]);

  // ── Generate particles ──
  function generateParticles(clearedIndices: number[], count = 25): Particle[] {
    const result: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const rowIdx = clearedIndices[Math.floor(Math.random() * clearedIndices.length)] - HIDDEN_ROWS;
      const x = Math.random() * COLS;
      const y = rowIdx + Math.random();
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.5 + Math.random() * 4;
      const size = 3 + Math.random() * 4;
      const color = PARTICLE_COLORS_MAP[Math.floor(Math.random() * PARTICLE_COLORS_MAP.length)];
      result.push({ id: Date.now() + i + Math.random(), x, y, color, angle, dist, size });
    }
    return result;
  }

  // ── Compute display board for rendering ──
  function getDisplayBoard(): { color: string; ghost: boolean; active: boolean; clearing: boolean }[][] {
    const g = gRef.current;
    const display: { color: string; ghost: boolean; active: boolean; clearing: boolean }[][] = [];

    for (let vr = 0; vr < VISIBLE_ROWS; vr++) {
      const br = vr + HIDDEN_ROWS;
      const row: { color: string; ghost: boolean; active: boolean; clearing: boolean }[] = [];
      const isClearing = clearingRows.includes(vr);
      for (let c = 0; c < COLS; c++) {
        const cell = g.board[br][c];
        row.push({ color: cell || '', ghost: false, active: false, clearing: isClearing });
      }
      display.push(row);
    }

    // Ghost piece
    if (g.current && g.ghostPos) {
      const shape = g.current.shape;
      const color = g.current.color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const vr = g.ghostPos.row + r - HIDDEN_ROWS;
          if (vr < 0 || vr >= VISIBLE_ROWS) continue;
          const col = g.ghostPos.col + c;
          if (col < 0 || col >= COLS) continue;
          if (!display[vr][col].active) {
            display[vr][col] = { color, ghost: true, active: false, clearing: false };
          }
        }
      }
    }

    // Current piece (overwrites ghost)
    if (g.current) {
      const shape = g.current.shape;
      const color = g.current.color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const vr = g.pos.row + r - HIDDEN_ROWS;
          if (vr < 0 || vr >= VISIBLE_ROWS) continue;
          const col = g.pos.col + c;
          if (col < 0 || col >= COLS) continue;
          display[vr][col] = { color, ghost: false, active: true, clearing: false };
        }
      }
    }

    return display;
  }

  // ── Render piece preview ──
  const renderPreview = (type: TetrominoKey | null, size = 20, grayed = false) => {
    if (!type) return <div style={{ width: size * 4, height: size * 3 }} />;
    const shape = SHAPES[type][0];
    const color = grayed ? '#444' : COLORS[type];
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${shape[0].length}, ${size}px)`,
          gap: 1,
        }}
      >
        {shape.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: size,
                height: size,
                backgroundColor: cell ? color : 'transparent',
                borderRadius: 2,
                transition: 'background-color 0.1s',
              }}
            />
          ))
        )}
      </div>
    );
  };

  // ── Format time ──
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Game data for render ──
  const g = gRef.current;
  const isNewHighScore = g.gameState === 'gameover' && g.score > highScoreRef.current && g.score > 0;
  const displayBoard = getDisplayBoard();
  const isPlaying = g.gameState === 'playing';
  const gravMs = getGravityMs(g.level);

  // ── Render ──
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '16px 0',
      userSelect: 'none',
      position: 'relative',
    }}>
      {/* Back button */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'var(--text-secondary)',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: 13,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          ← Back
        </button>
      </div>

      {/* Board + Side panels */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Hold panel */}
        <div style={{
          width: 100,
          background: 'var(--bg-card, #1a1a2e)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Hold</span>
          <div style={{ opacity: g.holdPiece && !g.canHold ? 0.3 : 1, transition: 'opacity 0.15s' }}>
            {renderPreview(g.holdPiece || null, 20, !g.canHold)}
          </div>
        </div>

        {/* Board */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
              gridTemplateRows: `repeat(${VISIBLE_ROWS}, ${CELL}px)`,
              borderRadius: 12,
              overflow: 'hidden',
              border: '2px solid var(--border-color, rgba(255,255,255,0.1))',
              background: 'rgba(0,0,0,0.4)',
              position: 'relative',
            }}
          >
            {displayBoard.map((row, ri) =>
              row.map((cell, ci) => {
                const baseBg = 'rgba(255,255,255,0.03)';
                let bg = baseBg;
                let opacity = 1;
                let boxShadow = 'none';

                if (cell.clearing) {
                  bg = 'rgba(255,255,255,0.8)';
                } else if (cell.ghost) {
                  bg = cell.color;
                  opacity = 0.2;
                } else if (cell.active) {
                  bg = cell.color;
                  boxShadow = `inset 0 0 8px ${cell.color}66, inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)`;
                } else if (cell.color) {
                  bg = cell.color;
                  boxShadow = `inset 0 0 4px ${cell.color}44, inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.15)`;
                }

                return (
                  <div
                    key={`${ri}-${ci}`}
                    style={{
                      width: CELL,
                      height: CELL,
                      backgroundColor: bg,
                      opacity,
                      boxShadow,
                      transition: cell.clearing ? 'none' : 'background-color 0.05s',
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Screen flash on Tetris */}
          {screenFlash && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.25)',
                pointerEvents: 'none',
                zIndex: 15,
              }}
            />
          )}

          {/* Particles */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 12, zIndex: 10 }}>
            {particles.map(p => {
              const startX = p.x * CELL + CELL / 2;
              const startY = p.y * CELL + CELL / 2;
              const dx = Math.cos(p.angle) * p.dist * CELL;
              const dy = Math.sin(p.angle) * p.dist * CELL;
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: startX,
                    top: startY,
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    backgroundColor: p.color,
                    boxShadow: `0 0 4px ${p.color}`,
                    animation: `particleFly 0.5s ease-out forwards`,
                    ['--dx' as string]: `${dx}px`,
                    ['--dy' as string]: `${dy}px`,
                  }}
                />
              );
            })}
          </div>

          {/* Style for particle animation */}
          <style>{`
            @keyframes particleFly {
              0% { transform: translate(0, 0) scale(1); opacity: 1; }
              100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
            }
            @keyframes lineClearFlash {
              0% { background-color: rgba(255,255,255,0.9); }
              50% { background-color: rgba(255,255,255,0.4); }
              100% { background-color: transparent; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
          `}</style>

          {/* Clean animation overlay for clearing rows */}
          {clearingRows.length > 0 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 12, zIndex: 5 }}>
              {clearingRows.map(vr => (
                <div
                  key={vr}
                  style={{
                    position: 'absolute',
                    top: vr * CELL,
                    left: 0,
                    width: COLS * CELL,
                    height: CELL,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    animation: 'lineClearFlash 0.3s ease-out forwards',
                  }}
                />
              ))}
            </div>
          )}

          {/* Menu overlay */}
          {g.gameState === 'menu' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 8, color: '#00f0ff', marginBottom: 4, textShadow: '0 0 30px rgba(0,240,255,0.3)' }}>
                TETRIS
              </div>
              <div style={{ color: '#ffd700', fontSize: 12, marginBottom: 24, letterSpacing: 2 }}>STUDYQUEST EDITION</div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 14,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  cursor: 'pointer',
                }}
              >
                Press ENTER to start
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                <span>← → Move</span>
                <span>↑/X Rotate</span>
                <span>Z CCW</span>
                <span>Space Drop</span>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {g.gameState === 'paused' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>PAUSED</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>ESC to resume · ENTER to restart</div>
            </div>
          )}

          {/* Game over overlay */}
          {g.gameState === 'gameover' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginBottom: 4 }}>GAME OVER</div>
              {isNewHighScore && (
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffd700',
                  background: 'rgba(255,215,0,0.15)',
                  padding: '2px 10px',
                  borderRadius: 20,
                  marginBottom: 8,
                  letterSpacing: 1,
                }}>
                  NEW HIGH SCORE!
                </div>
              )}
              <div style={{ fontSize: 40, fontWeight: 800, color: '#00f0ff', lineHeight: 1 }}>
                {g.score.toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12, marginBottom: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>LEVEL</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{g.level}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>LINES</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{g.lines}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>PIECES</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{g.piecesCount}</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>TIME</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6' }}>{formatTime(Math.floor((g.startTime ? (Date.now() - g.startTime) / 1000 : 0)))}</div>
                </div>
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 12,
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 20,
              }}>
                +{Math.floor(g.score / 100)} XP earned
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  cursor: 'pointer',
                }}
              >
                Press ENTER to restart
              </div>
            </div>
          )}
        </div>

        {/* Next panel */}
        <div style={{
          width: 100,
          background: 'var(--bg-card, #1a1a2e)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Next</span>
          {g.nextQueue.slice(0, 3).map((type, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              {renderPreview(type, 18)}
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: 24,
        padding: '10px 24px',
        background: 'var(--bg-card, #1a1a2e)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        borderRadius: 12,
        minWidth: 400,
        justifyContent: 'center',
      }}>
        <Stat label="Score" value={g.score.toLocaleString()} color="#00f0ff" />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <Stat label="Level" value={String(g.level)} color="#8b5cf6" />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <Stat label="Lines" value={String(g.lines)} color="#10b981" />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <Stat label="Pieces" value={String(g.piecesCount)} color="#f97316" />
        {g.gameState === 'playing' && (
          <>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <Stat label="Combo" value={g.combo > 0 ? `${g.combo}x` : '-'} color="#ffd700" />
          </>
        )}
        {g.gameState === 'playing' && g.backToBack && (
          <>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <Stat label="B2B" value="!" color="#ef4444" />
          </>
        )}
      </div>

      {/* Controls help */}
      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 11,
        color: 'rgba(255,255,255,0.25)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 500,
      }}>
        <span>← → Move</span>
        <span>↑ / X Rotate CW</span>
        <span>Z Rotate CCW</span>
        <span>↓ Soft Drop</span>
        <span>Space Hard Drop</span>
        <span>C / Shift Hold</span>
        <span>ESC Pause</span>
      </div>
    </div>
  );
}

// ─── Stat sub-component ─────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 1 }}>{value}</div>
    </div>
  );
}
