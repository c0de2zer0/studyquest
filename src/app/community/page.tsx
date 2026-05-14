'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, Swords, Trophy, X, Plus, Send, Search,
  Eye, Crosshair, Sparkles, ChevronDown, ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn, formatNumber } from '@/lib/utils';
import { SUBJECTS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { CommunityPost, RoomMember } from '@/lib/mock-data';

// ─── Types ─────────────────────────────────────────────────────────────────

type FeedTab = 'explore' | 'battle' | 'channel_post' | 'tournament';

interface ViewingUser {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isVerified?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const FEED_TABS: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'explore', label: 'Ke\u015ffet', icon: MessageSquare },
  { id: 'battle', label: 'Kap\u0131\u015fmalar', icon: Swords },
  { id: 'channel_post', label: 'Kanallar', icon: Users },
  { id: 'tournament', label: 'Turnuvalar', icon: Trophy },
];

const REACTION_EMOJIS = ['\uD83D\uDD25', '\uD83D\uDCAA', '\u2764\uFE0F', '\uD83C\uDF89', '\uD83D\uDE24', '\uD83D\uDC51'];

const DURATION_OPTIONS = [
  { value: 30, label: '30 dk' },
  { value: 60, label: '60 dk' },
  { value: 90, label: '90 dk' },
  { value: 120, label: '2 sa' },
  { value: 180, label: '3 sa' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function hashNum(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000000;
  return (h % mod) + 1;
}

// ─── Create Post Bar ───────────────────────────────────────────────────────

function CreatePostBar({ onOpen }: { onOpen: () => void }) {
  const user = useStore((s) => s.user);

  return (
    <button
      onClick={onOpen}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all',
        'bg-[var(--bg-surface)] border border-[var(--border-color)]',
        'hover:bg-[var(--bg-hover)] hover:border-[var(--border-hover)]',
        'cursor-pointer group'
      )}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border-2"
        style={{
          backgroundColor: `${user.avatar?.glowColor || '#7B5CF5'}18`,
          borderColor: `${user.avatar?.glowColor || '#7B5CF5'}40`,
        }}
      >
        {user.emoji}
      </div>
      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
        Bir \u015Feyler payla\u015F...
      </span>
      <div className="ml-auto flex gap-2">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--active-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          Payla\u015F\u0131m
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
          Yar\u0131\u015Fma
        </span>
      </div>
    </button>
  );
}

// ─── Create Post Form ─────────────────────────────────────────────────────

function CreatePostForm({ onClose }: { onClose: () => void }) {
  const { user, createPost } = useStore((s) => ({
    user: s.user,
    createPost: s.createPost,
  }));

  const [type, setType] = useState<'post' | 'challenge'>('post');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]!.name);
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost({
      type,
      content: content.trim(),
      userId: user.id,
      userName: user.name,
      userEmoji: user.emoji,
      userColor: user.avatar?.glowColor || '#7B5CF5',
      ...(type === 'challenge' ? { subject, durationMin: duration } : {}),
    });
    onClose();
  };

  return (
    <Card padding="md" glow="purple" className="space-y-3">
      {/* Type toggle */}
      <div className="flex gap-2">
        {(['post', 'challenge'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              type === t
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-color)]'
            )}
          >
            {t === 'post' ? '\uD83D\uDCDD Payla\u015F\u0131m' : '\u2694\uFE0F Yar\u0131\u015Fma'}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={type === 'post' ? 'Bir \u015Feyler payla\u015F...' : 'Rakiplerini yar\u0131\u015Fmaya \u00E7a\u011F\u0131r!'}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl p-3 text-sm outline-none',
          'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
          'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20'
        )}
      />

      {/* Challenge options */}
      <AnimatePresence>
        {type === 'challenge' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-3 overflow-hidden"
          >
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn(
                'flex-1 rounded-xl px-3 py-2 text-xs outline-none appearance-none',
                'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
                'text-[var(--text-primary)]'
              )}
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={cn(
                'rounded-xl px-3 py-2 text-xs outline-none appearance-none',
                'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
                'text-[var(--text-primary)]'
              )}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          \u0130ptal
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!content.trim()}
          onClick={handleSubmit}
          icon={Send}
        >
          Payla\u015F
        </Button>
      </div>
    </Card>
  );
}

// ─── MyRoomCard ────────────────────────────────────────────────────────────

function MyRoomCard() {
  const { myRoom, leaveCurrentRoom, sendRoomMessage } = useStore((s) => ({
    myRoom: s.myRoom,
    leaveCurrentRoom: s.leaveCurrentRoom,
    sendRoomMessage: s.sendRoomMessage,
  }));
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');

  if (!myRoom) return null;

  const displayMembers = myRoom.members.slice(0, 5);
  const overflow = myRoom.members.length - 5;
  const lastMsgs = myRoom.messages.slice(-5);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'sticky top-[60px] z-30 rounded-2xl border p-4',
        'bg-gradient-to-br from-purple-900/20 via-[var(--bg-card)] to-cyan-900/10',
        'border-purple-500/20 shadow-lg shadow-purple-500/5 backdrop-blur-xl'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 flex-shrink-0"
          style={{
            backgroundColor: `${myRoom.subjectColor}22`,
            borderColor: `${myRoom.subjectColor}50`,
          }}
        >
          {myRoom.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-purple-300 truncate">{myRoom.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">
            {myRoom.ownerName}&apos;\u0131n odas\u0131
            <span className="text-emerald-400 ml-1">\u25CF Aktif</span>
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={leaveCurrentRoom}>
          \u00C7\u0131k\u0131\u015F
        </Button>
      </div>

      {/* Members row + actions */}
      <div className="flex items-center gap-1.5 mb-3">
        {displayMembers.map((m: RoomMember) => (
          <div
            key={m.id}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 -ml-1 first:ml-0"
            style={{
              backgroundColor: `${m.color}22`,
              borderColor: m.color,
            }}
            title={m.name}
          >
            {m.emoji}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] -ml-1">
            +{overflow}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          {myRoom.permissions.canWrite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatOpen(!chatOpen)}
              icon={chatOpen ? ChevronDown : MessageSquare}
            >
              Sohbet
            </Button>
          )}
          {myRoom.permissions.canCompete && (
            <Button variant="ghost" size="sm" icon={Swords}>
              Kap\u0131\u015F
            </Button>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-3 space-y-3">
              <div className="max-h-40 overflow-y-auto space-y-1.5 min-h-[60px]">
                {lastMsgs.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-4">
                    Hen\u00FCz mesaj yok. \u0130lk sen yaz!
                  </p>
                ) : (
                  lastMsgs.map((m) => (
                    <div key={m.id} className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-purple-400 font-medium">
                        {m.userEmoji} {m.userName}:
                      </span>{' '}
                      {m.content}
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && msg.trim()) {
                      sendRoomMessage(msg);
                      setMsg('');
                    }
                  }}
                  placeholder="Bir \u015Fey yaz..."
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-xs outline-none',
                    'bg-[var(--bg-card)] border border-[var(--border-subtle)]',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]'
                  )}
                />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!msg.trim()}
                  onClick={() => {
                    if (msg.trim()) {
                      sendRoomMessage(msg);
                      setMsg('');
                    }
                  }}
                  icon={Send}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── RoomSearch ────────────────────────────────────────────────────────────

function RoomSearch({ onCreateClick }: { onCreateClick: () => void }) {
  const [query, setQuery] = useState('');
  const { rooms, myRoom, joinRoomById } = useStore((s) => ({
    rooms: s.rooms,
    myRoom: s.myRoom,
    joinRoomById: s.joinRoomById,
  }));

  const filtered = rooms.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Oda ara... (Matematik, Fizik, YKS...)"
            className={cn(
              'w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none',
              'bg-[var(--bg-surface)] border border-[var(--border-color)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/10'
            )}
          />
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={onCreateClick}>
          Oda Kur
        </Button>
      </div>

      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 max-h-[260px] overflow-y-auto"
          >
            {filtered.map((room) => {
              const isFull = room.members.length >= room.capacity;
              const isMyRoom = myRoom?.id === room.id;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'rounded-xl border p-3 transition-all',
                    'bg-[var(--bg-card)]',
                    isMyRoom
                      ? 'border-emerald-500/20'
                      : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base border-2 flex-shrink-0"
                      style={{
                        backgroundColor: `${room.subjectColor}22`,
                        borderColor: `${room.subjectColor}40`,
                      }}
                    >
                      {room.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold truncate"
                        style={{ color: room.subjectColor }}
                      >
                        {room.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {room.ownerName}&apos;\u0131n odas\u0131 &middot;{' '}
                        {room.isOpen ? (
                          <span className="text-emerald-400">A\u00E7\u0131k</span>
                        ) : (
                          <span className="text-yellow-400">Davetli</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={isFull ? 'danger' : 'success'}
                      size="sm"
                    >
                      {room.members.length}/{room.capacity}
                    </Badge>
                  </div>

                  <div className="flex gap-1.5 mb-2.5 flex-wrap">
                    {room.permissions.canWrite && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                        \uD83D\uDCDD Yazabilirsin
                      </span>
                    )}
                    {room.permissions.canCompete && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                        \u2694\uFE0F Kap\u0131\u015Fabilirsin
                      </span>
                    )}
                    {!room.permissions.canWrite && !room.permissions.canCompete && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                        \uD83D\uDD12 Sadece izle
                      </span>
                    )}
                  </div>

                  <Button
                    variant={isMyRoom ? 'secondary' : isFull ? 'ghost' : 'primary'}
                    size="sm"
                    className="w-full"
                    disabled={isFull && !isMyRoom}
                    onClick={() => joinRoomById(room.id)}
                  >
                    {isMyRoom
                      ? '✓ Bu Odadas\u0131n'
                      : isFull
                        ? 'Dolu'
                        : 'ODAYA G\u0130R'}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {query && filtered.length === 0 && (
        <div className="text-center py-6 text-sm text-[var(--text-muted)]">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Oda bulunamad\u0131</p>
        </div>
      )}
    </div>
  );
}

// ─── CreateRoomModal ───────────────────────────────────────────────────────

function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const createRoom = useStore((s) => s.createRoom);
  const user = useStore((s) => s.user);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]!.name);
  const [canWrite, setCanWrite] = useState(true);
  const [canCompete, setCanCompete] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const selectedSubject = SUBJECTS.find((s) => s.name === subject) ?? SUBJECTS[0]!;

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom({
      name: name.trim(),
      subject,
      subjectColor: selectedSubject.color,
      emoji: selectedSubject.emoji,
      ownerId: user.id,
      ownerName: user.name,
      capacity: 10,
      isOpen,
      permissions: { canWrite, canCompete },
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card padding="lg" glow="purple" className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-purple-300">+ Yeni Oda Kur</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Room name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Oda Ad\u0131
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Oda ad\u0131n\u0131 gir..."
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm outline-none',
                'bg-[var(--bg-surface)] border border-[var(--border-color)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/10'
              )}
              autoFocus
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Ders
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none',
                'bg-[var(--bg-surface)] border border-[var(--border-color)]',
                'text-[var(--text-primary)]'
              )}
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              \u00DCyeler ne yapabilir?
            </label>
            <div className="flex gap-2">
              {[
                { label: '\uD83D\uDCDD Yazabilir', val: canWrite, set: setCanWrite },
                { label: '\u2694\uFE0F Kap\u0131\u015Fabilir', val: canCompete, set: setCanCompete },
              ].map(({ label, val, set }) => (
                <button
                  key={label}
                  onClick={() => set((v: boolean) => !v)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                    val
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Room type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Oda T\u00FCr\u00FC
            </label>
            <div className="flex gap-2">
              {[
                { label: 'A\u00E7\u0131k Oda', val: true },
                { label: 'Davetli', val: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setIsOpen(opt.val)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                    isOpen === opt.val
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
              \u0130ptal
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-[2]"
              disabled={!name.trim()}
              onClick={handleCreate}
            >
              ODA KUR
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── UserProfileModal ──────────────────────────────────────────────────────

function UserProfileModal({
  user: viewUser,
  onClose,
}: {
  user: ViewingUser;
  onClose: () => void;
}) {
  const { communityPosts, showToast } = useStore((s) => ({
    communityPosts: s.communityPosts,
    showToast: s.showToast,
  }));

  const userPosts = communityPosts.filter((p) => p.userId === viewUser.id);

  // Deterministic mock stats
  const mockLevel = hashNum(viewUser.id, 30);
  const mockHours = hashNum(viewUser.id + 'h', 800);
  const mockStreak = hashNum(viewUser.id + 's', 90);
  const mockTournaments = hashNum(viewUser.id + 't', 20);

  const stats = [
    { label: 'SEV\u0130YE', value: mockLevel },
    { label: 'TOPLAM SA', value: mockHours },
    { label: 'SER\u0130', value: mockStreak },
    { label: 'TURNUVA', value: mockTournaments },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden',
          'bg-[var(--bg-card)] border border-[var(--border-color)]',
          'max-h-[85vh] flex flex-col'
        )}
      >
        {/* Gradient header */}
        <div
          className="p-5 pb-4 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${viewUser.color}18, transparent)`,
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
              PROF\u0130L
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-[3px] flex-shrink-0"
              style={{
                backgroundColor: `${viewUser.color}22`,
                borderColor: viewUser.color,
                boxShadow: `0 0 24px ${viewUser.color}30`,
              }}
            >
              {viewUser.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-bold"
                  style={{ color: viewUser.color }}
                >
                  {viewUser.name}
                </h2>
                {viewUser.isVerified && (
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {userPosts.length} payla\u015F\u0131m
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-0 mb-4 rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center py-2.5 px-1 bg-[var(--bg-surface)]"
                style={{
                  borderLeft: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div
                  className="text-base font-bold font-mono"
                  style={{ color: viewUser.color }}
                >
                  {s.value}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5 font-mono tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => {
                showToast(`${viewUser.emoji} ${viewUser.name} ile arkadaş oldun!`, 'success', '\uD83E\uDD1D');
                onClose();
              }}
            >
              + Arkada\u015F Ekle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                showToast('Rando daveti g\u00F6nderildi!', 'info', '\u2694\uFE0F');
                onClose();
              }}
            >
              \u2694\uFE0F Rando Davet
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-3">
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider mb-2">
            SON PAYLA\u015EIMLAR
          </p>
          {userPosts.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
              Hen\u00FCz payla\u015F\u0131m yok
            </div>
          ) : (
            userPosts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="rounded-xl p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              >
                <div className="text-[10px] font-mono text-[var(--text-muted)] mb-1.5">
                  {post.type === 'battle'
                    ? '\u2694\uFE0F Kap\u0131\u015Fma'
                    : post.type === 'challenge'
                      ? '\uD83C\uDFC6 Yar\u0131\u015Fma'
                      : '\uD83D\uDCDD Payla\u015F\u0131m'}{' '}
                  &middot; {post.timestamp}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {post.content}
                </p>
                {post.reactions.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {post.reactions.map((r) => (
                      <span
                        key={r.emoji}
                        className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                      >
                        {r.emoji} {r.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Emoji Reaction Picker ─────────────────────────────────────────────────

function ReactionPicker({
  postId,
  addReaction,
  onClose,
}: {
  postId: string;
  addReaction: (id: string, emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      className="absolute bottom-full left-0 mb-1 z-10"
    >
      <div className="flex gap-1.5 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg shadow-black/20">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              addReaction(postId, emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--hover-bg)] transition-all text-lg hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── PostCard ──────────────────────────────────────────────────────────────

function PostCard({
  post,
  onReact,
  onJoin,
  onUserClick,
}: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
  onJoin?: (id: string) => void;
  onUserClick?: (user: ViewingUser) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isChallenge = post.type === 'challenge';
  const joined = (post.participants ?? []).includes('me');

  const userData: ViewingUser = {
    id: post.userId,
    name: post.userName,
    emoji: post.userEmoji,
    color: post.userColor,
  };

  return (
    <Card hover padding="md">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <button
          onClick={() => onUserClick?.(userData)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border-2 transition-transform hover:scale-105"
          style={{
            backgroundColor: `${post.userColor}18`,
            borderColor: `${post.userColor}40`,
          }}
        >
          {post.userEmoji}
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUserClick?.(userData)}
              className="text-sm font-semibold text-[var(--text-primary)] hover:underline cursor-pointer"
              style={{ color: post.userColor }}
            >
              {post.userName}
            </button>
            <span className="text-xs text-[var(--text-muted)]">{post.timestamp}</span>
            {isChallenge && (
              <Badge variant="purple" size="sm" className="ml-auto">
                YARI\u015EMA
              </Badge>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {post.content}
          </p>

          {/* Challenge metadata */}
          {isChallenge && post.subject && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: `${post.subjectColor || '#7B5CF5'}0C`,
                border: `1px solid ${post.subjectColor || '#7B5CF5'}22`,
              }}
            >
              <span className="text-lg">
                {SUBJECTS.find((s) => s.name === post.subject)?.emoji ?? '\uD83D\uDCDA'}
              </span>
              <div className="flex-1">
                <p
                  className="text-xs font-semibold"
                  style={{ color: post.subjectColor || 'var(--text-primary)' }}
                >
                  {post.subject}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {post.durationMin} dk &middot; {(post.participants ?? []).length} kat\u0131l\u0131mc\u0131
                </p>
              </div>
              <Button
                variant={joined ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onJoin?.(post.id)}
              >
                {joined ? '\u2713 KATILDIN' : 'KATIL'}
              </Button>
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-1.5 flex-wrap relative">
            {post.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(post.id, r.emoji)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border',
                  r.reacted
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-color)]'
                )}
              >
                {r.emoji}
                <span className="font-mono">{r.count}</span>
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border',
                  showPicker
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-color)]'
                )}
              >
                + \uD83D\uDE0A
              </button>
              <AnimatePresence>
                {showPicker && (
                  <ReactionPicker
                    postId={post.id}
                    addReaction={onReact}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── BattleCard ────────────────────────────────────────────────────────────

function BattleCard({
  post,
  onUserClick,
}: {
  post: CommunityPost;
  onUserClick?: (user: ViewingUser) => void;
}) {
  const [showScore, setShowScore] = useState(false);
  const p1 = post.player1!;
  const p2 = post.player2!;
  const mins = Math.floor((post.timeRemainingSeconds ?? 0) / 60);
  const secs = (post.timeRemainingSeconds ?? 0) % 60;

  return (
    <Card padding="md" glow="purple" className="relative overflow-hidden">
      {/* Live badge */}
      <div className="absolute -top-px left-4">
        <Badge variant="info" size="sm" dot className="shadow-lg shadow-red-500/20">
          \u2694\uFE0F CANLI KAPI\u015EMA
        </Badge>
      </div>

      {/* Players VS */}
      <div className="flex items-center gap-3 mt-4 mb-3">
        <button
          onClick={() => onUserClick?.({ id: p1.id, name: p1.name, emoji: p1.emoji, color: p1.color })}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0"
            style={{
              backgroundColor: `${p1.color}22`,
              borderColor: p1.color,
            }}
          >
            {p1.emoji}
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: p1.color }}
          >
            {p1.name}
          </span>
        </button>

        <div className="text-lg font-black font-mono text-red-400 flex-shrink-0">VS</div>

        <button
          onClick={() => onUserClick?.({ id: p2.id, name: p2.name, emoji: p2.emoji, color: p2.color })}
          className="flex items-center gap-2 flex-1 min-w-0 justify-end cursor-pointer"
        >
          <span
            className="text-sm font-semibold truncate"
            style={{ color: p2.color }}
          >
            {p2.name}
          </span>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0"
            style={{
              backgroundColor: `${p2.color}22`,
              borderColor: p2.color,
            }}
          >
            {p2.emoji}
          </div>
        </button>
      </div>

      {/* Score bars */}
      <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold font-mono"
            style={{ color: p1.color }}
          >
            {p1.score}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {post.battleSubject}
          </span>
          <span
            className="text-xs font-bold font-mono"
            style={{ color: p2.color }}
          >
            {p2.score}
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-card)]">
          <div
            className="h-full transition-all duration-500"
            style={{
              flex: p1.score,
              backgroundColor: p1.color,
            }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{
              flex: p2.score,
              backgroundColor: p2.color,
            }}
          />
        </div>
        <div className="text-center text-[10px] font-mono text-red-400">
          \u23F1 {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} kald\u0131
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10"
          icon={Eye}
          onClick={() => setShowScore(!showScore)}
        >
          \u0130zle
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
          icon={Crosshair}
        >
          Meydan Oku
        </Button>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {showScore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
              {p1.name}: {p1.score} &middot; {p2.name}: {p2.score} &mdash;{' '}
              {post.battleSubject} kap\u0131\u015Fmas\u0131 devam ediyor
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── TournamentCard ────────────────────────────────────────────────────────

function TournamentCard({
  post,
  borderColor,
}: {
  post: CommunityPost;
  borderColor: string;
}) {
  const showToast = useStore((s) => s.showToast);
  const pct = Math.round(
    ((post.tournamentParticipants ?? 0) / (post.tournamentCapacity ?? 1)) * 100
  );

  return (
    <div
      className="rounded-xl p-3 space-y-2 border mt-2"
      style={{
        backgroundColor: `${borderColor}08`,
        borderColor: `${borderColor}22`,
      }}
    >
      <p
        className="text-sm font-bold font-mono"
        style={{ color: borderColor }}
      >
        \uD83C\uDFC6 {post.tournamentName}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">
        \u00D6d\u00FCl: {post.tournamentPrize} &middot; Ba\u015Flang\u0131\u00E7: {post.tournamentStartTime}
      </p>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[var(--text-muted)]">\uD83D\uDC65 Kat\u0131l\u0131mc\u0131lar</span>
        <span style={{ color: borderColor }}>
          {post.tournamentParticipants} / {post.tournamentCapacity}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${borderColor}, ${borderColor}88)`,
          }}
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() =>
          showToast(`${post.tournamentName} turnuvas\u0131na kat\u0131ld\u0131n!`, 'success', '\u2694\uFE0F')
        }
      >
        \u2694\uFE0F TURNUVAYA KATIL
      </Button>
    </div>
  );
}

// ─── ChannelCard ───────────────────────────────────────────────────────────

function ChannelCard({
  post,
  onReact,
  onUserClick,
}: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
  onUserClick?: (user: ViewingUser) => void;
}) {
  const [following, setFollowing] = useState(false);
  const borderColor = post.channelBorderColor ?? '#7B5CF5';

  return (
    <Card padding="md" glow="gold" className="relative overflow-hidden">
      {/* Verified badge */}
      <div className="absolute -top-px left-4">
        <Badge
          variant="warning"
          size="sm"
          className="shadow-lg"
        >
          \u2726 ONAYLI KANAL
        </Badge>
      </div>

      {/* Channel header */}
      <div className="flex items-center gap-3 mt-4 mb-3">
        <button
          onClick={() =>
            onUserClick?.({
              id: post.userId,
              name: post.channelName ?? post.userName,
              emoji: post.channelEmoji ?? post.userEmoji,
              color: borderColor,
              isVerified: true,
            })
          }
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
          style={{
            backgroundColor: `${borderColor}18`,
            borderColor: `${borderColor}40`,
          }}
        >
          {post.channelEmoji}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUserClick?.({
                  id: post.userId,
                  name: post.channelName ?? post.userName,
                  emoji: post.channelEmoji ?? post.userEmoji,
                  color: borderColor,
                  isVerified: true,
                })
              }
              className="text-sm font-bold truncate cursor-pointer hover:underline"
              style={{ color: borderColor }}
            >
              {post.channelName}
            </button>
            <ExternalLink
              className="w-3 h-3 flex-shrink-0"
              style={{ color: borderColor }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            {formatNumber(post.followerCount ?? 0)} takip\u00E7i &middot;{' '}
            {post.timestamp}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            following
              ? 'border-emerald-500/30 text-emerald-400'
              : 'border-[var(--border-color)]'
          )}
          style={{
            backgroundColor: following
              ? 'rgba(16,185,129,0.1)'
              : `${borderColor}15`,
          }}
          onClick={() => setFollowing(!following)}
        >
          {following ? '\u2713 TAK\u0130P' : 'TAK\u0130P ET'}
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
          {post.content}
        </p>
      )}

      {/* Tournament embed */}
      {post.tournamentName && (
        <TournamentCard post={post} borderColor={borderColor} />
      )}

      {/* Reactions */}
      {post.reactions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {post.reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onReact(post.id, r.emoji)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border',
                r.reacted
                  ? 'bg-[var(--active-bg)] border-[var(--border-color)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-color)]'
              )}
            >
              {r.emoji} {r.count}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function CommunityPage() {
  const {
    communityPosts,
    addPostReaction,
    joinChallenge,
  } = useStore((s) => ({
    communityPosts: s.communityPosts,
    addPostReaction: s.addPostReaction,
    joinChallenge: s.joinChallenge,
  }));

  const [tab, setTab] = useState<FeedTab>('explore');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [viewingUser, setViewingUser] = useState<ViewingUser | null>(null);

  // Filter posts by tab
  const filtered = communityPosts.filter((p) => {
    if (tab === 'explore') return true;
    if (tab === 'tournament') return p.tournamentName != null;
    if (tab === 'channel_post') return p.isVerifiedChannel === true;
    return p.type === tab;
  });

  const handleUserClick = (u: ViewingUser) => {
    setViewingUser(u);
  };

  const renderPost = (post: CommunityPost) => {
    if (post.type === 'battle') {
      return <BattleCard key={post.id} post={post} onUserClick={handleUserClick} />;
    }
    if (post.isVerifiedChannel) {
      return (
        <ChannelCard
          key={post.id}
          post={post}
          onReact={addPostReaction}
          onUserClick={handleUserClick}
        />
      );
    }
    return (
      <PostCard
        key={post.id}
        post={post}
        onReact={addPostReaction}
        onJoin={joinChallenge}
        onUserClick={handleUserClick}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 max-w-3xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Topluluk
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Di\u011Fer \u00F6\u011Frencilerle ba\u011Flan, yar\u0131\u015F, payla\u015F
          </p>
        </div>
      </div>

      {/* MyRoomCard (sticky, shown when in a room) */}
      <MyRoomCard />

      {/* RoomSearch + CreateRoom modal */}
      <RoomSearch onCreateClick={() => setShowCreateRoom(true)} />

      {/* Feed Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        {FEED_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              tab === t.id
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Create Post Bar / Form */}
      {!showCreate ? (
        <CreatePostBar onOpen={() => setShowCreate(true)} />
      ) : (
        <CreatePostForm onClose={() => setShowCreate(false)} />
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-3 opacity-40" />
            <p className="text-[var(--text-secondary)] font-medium">
              G\u00F6nderi bulunamad\u0131
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Bu sekmede hen\u00FCz i\u00E7erik yok
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {renderPost(post)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* CreateRoomModal */}
      <AnimatePresence>
        {showCreateRoom && (
          <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
        )}
      </AnimatePresence>

      {/* UserProfileModal */}
      <AnimatePresence>
        {viewingUser && (
          <UserProfileModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
