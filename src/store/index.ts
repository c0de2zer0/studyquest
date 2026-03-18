'use client';
import { create } from 'zustand';
import { mockUser, mockTasks, mockMarketItems, mockChatMessages, mockVoiceRooms, mockNotifications, mockTournaments, mockCommunityPosts, mockTaskHistory, mockIntegrationSubjects, type CommunityPost, type TaskHistoryEntry } from '@/lib/mock-data';
import { TIMER_MODES, POMODORO_COUNT, XP_PER_MINUTE, LP_PER_MINUTE, RANK_TIERS, SUBJECTS } from '@/lib/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TabId = 'dashboard'|'timer'|'plan'|'avatar'|'market'|'community'|'tournament'|'rando'|'leaderboard'|'analytics'|'profile';
export type TimerMode = 'pomodoro'|'long'|'free'|'custom';
export type TimerPhase = 'work'|'break';
export type RandoState = 'idle'|'searching'|'matched'|'active'|'break'|'rating'|'complete';
export type UserStatus = 'online'|'studying'|'break'|'dnd'|'offline';

export interface Task {
  id: string;
  name: string;
  subject: string;
  subjectColor: string;
  subjectEmoji: string;
  startTime: string;
  endTime: string;
  duration: number;
  coins: number;
  status: 'done' | 'active' | 'pending';
  xp: number;
  elapsed?: number;
}

export interface MarketItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  rarity: string;
  price: number;
  owned: boolean;
  equipped: boolean;
  isDaily?: boolean;
  dailyPrice?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success'|'error'|'info'|'warning';
  emoji?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  content: string;
  timestamp: string;
  channel: string;
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  isSystem?: boolean;
  replyTo?: string;
}

export interface StoreState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // User
  user: typeof mockUser;
  updateUserStatus: (status: UserStatus) => void;

  // Timer
  timerMode: TimerMode;
  timerPhase: TimerPhase;
  elapsed: number;
  isRunning: boolean;
  pomDone: number;
  activeSubject: string;
  customWork: number;
  customBreak: number;
  showSessionComplete: boolean;
  sessionXpEarned: number;
  sessionCoinsEarned: number;
  ambientSound: string | null;
  ambientVolume: number;
  setTimerMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  skipPhase: () => void;
  tickTimer: () => void;
  setActiveSubject: (subject: string) => void;
  setCustomWork: (v: number) => void;
  setCustomBreak: (v: number) => void;
  dismissSessionComplete: () => void;
  setAmbientSound: (sound: string | null) => void;
  setAmbientVolume: (v: number) => void;

  // Tasks
  tasks: Task[];
  addTask: (name: string) => void;
  completeTask: (id: string) => void;
  reorderTasks: (fromIdx: number, toIdx: number) => void;

  // Market / Inventory
  items: MarketItem[];
  buyItem: (id: string) => boolean;
  equipItem: (id: string) => void;
  unequipItem: (id: string) => void;
  marketCategory: string;
  marketSort: string;
  marketSearch: string;
  setMarketCategory: (c: string) => void;
  setMarketSort: (s: string) => void;
  setMarketSearch: (s: string) => void;

  // Chat
  messages: Message[];
  activeChannel: string;
  joinedRooms: string[];
  voiceRooms: typeof mockVoiceRooms;
  sendMessage: (text: string, replyTo?: string) => void;
  addReaction: (msgId: string, emoji: string) => void;
  setActiveChannel: (id: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  userStatus: UserStatus;
  setUserStatus: (status: UserStatus) => void;

  // Rando
  randoState: RandoState;
  randoOpponent: { name: string; emoji: string; level: number } | null;
  randoElapsed: number;
  randoStars: number;
  randoSubject: string;
  randoDuration: number;
  randoFormat: string;
  setRandoState: (state: RandoState) => void;
  setRandoOpponent: (o: { name: string; emoji: string; level: number } | null) => void;
  tickRando: () => void;
  setRandoStars: (n: number) => void;
  completeRando: () => void;
  cancelRando: () => void;
  setRandoSubject: (s: string) => void;
  setRandoDuration: (d: number) => void;
  setRandoFormat: (f: string) => void;

  // Tournament
  tournaments: typeof mockTournaments;
  joinTournament: (id: string) => void;
  expandedTournaments: string[];
  toggleExpandTournament: (id: string) => void;

  // Notifications
  notifications: typeof mockNotifications;
  addNotification: (n: Omit<typeof mockNotifications[0], 'id'>) => void;
  markAllRead: () => void;
  unreadCount: number;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], emoji?: string) => void;
  dismissToast: (id: string) => void;

  // Plan
  planView: 'week'|'day'|'list';
  setPlanView: (v: 'week'|'day'|'list') => void;
  planWeekOffset: number;
  setPlanWeekOffset: (o: number) => void;

  // Profile settings
  profileTab: 'profile'|'settings';
  setProfileTab: (t: 'profile'|'settings') => void;

  // Rank
  gainLP: (minutesStudied: number) => void;
  dismissRankUp: () => void;

  // Community posts
  communityPosts: CommunityPost[];
  createPost: (post: Omit<CommunityPost, 'id' | 'participants' | 'reactions' | 'timestamp'>) => void;
  joinChallenge: (postId: string) => void;
  addPostReaction: (postId: string, emoji: string) => void;

  // Task history
  taskHistory: TaskHistoryEntry[];

  // Integration subjects
  integrationSubjects: typeof mockIntegrationSubjects;

  // All subjects (computed: SUBJECTS + integrationSubjects)
  getAllSubjects: () => { id: string; name: string; emoji: string; color: string }[];

  // Lobby
  activeLobbyRoom: string | null;
  openLobby: (roomId: string) => void;
  closeLobby: () => void;
}

function getDuration(mode: TimerMode, phase: TimerPhase, customWork: number, customBreak: number): number {
  if (mode === 'free') return Infinity;
  if (mode === 'custom') return phase === 'work' ? customWork * 60 : customBreak * 60;
  const m = TIMER_MODES[mode as keyof typeof TIMER_MODES];
  return phase === 'work' ? m.workDuration : m.breakDuration;
}

export const useStore = create<StoreState>((set, get) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // User
  user: { ...mockUser },
  updateUserStatus: (status) => set(s => ({ user: { ...s.user, status } })),

  // Timer
  timerMode: 'pomodoro',
  timerPhase: 'work',
  elapsed: 0,
  isRunning: false,
  pomDone: 0,
  activeSubject: 'Matematik',
  customWork: 25,
  customBreak: 5,
  showSessionComplete: false,
  sessionXpEarned: 0,
  sessionCoinsEarned: 0,
  ambientSound: null,
  ambientVolume: 60,

  setTimerMode: (mode) => set({ timerMode: mode, elapsed: 0, isRunning: false, timerPhase: 'work' }),
  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  stopTimer: () => {
    const { elapsed, timerPhase } = get();
    if (timerPhase !== 'work' || elapsed < 5) {
      set({ isRunning: false, elapsed: 0, timerPhase: 'work' });
      return;
    }
    const xp = Math.round((elapsed / 60) * XP_PER_MINUTE);
    const coins = elapsed / 3600;
    get().gainLP(Math.round(elapsed / 60));
    set(s => ({
      isRunning: false,
      elapsed: 0,
      timerPhase: 'work',
      showSessionComplete: true,
      sessionXpEarned: xp,
      sessionCoinsEarned: parseFloat(coins.toFixed(2)),
      user: {
        ...s.user,
        xp: Math.min(s.user.xp + xp, s.user.xpMax),
        balance: parseFloat((s.user.balance + coins).toFixed(2)),
        todayHours: parseFloat((s.user.todayHours + elapsed / 3600).toFixed(2)),
        totalHours: parseFloat((s.user.totalHours + elapsed / 3600).toFixed(2)),
      }
    }));
  },
  skipPhase: () => {
    const { timerPhase, pomDone } = get();
    const nextPhase: TimerPhase = timerPhase === 'work' ? 'break' : 'work';
    const newPomDone = timerPhase === 'work' ? pomDone + 1 : pomDone;
    set({ timerPhase: nextPhase, elapsed: 0, pomDone: newPomDone % POMODORO_COUNT });
  },
  tickTimer: () => {
    const { elapsed, timerMode, timerPhase, pomDone, customWork, customBreak } = get();
    const duration = getDuration(timerMode, timerPhase, customWork, customBreak);
    if (elapsed + 1 >= duration && duration !== Infinity) {
      const nextPhase: TimerPhase = timerPhase === 'work' ? 'break' : 'work';
      const newPomDone = timerPhase === 'work' ? (pomDone + 1) % POMODORO_COUNT : pomDone;
      if (timerPhase === 'work') {
        const xp = Math.round((duration / 60) * XP_PER_MINUTE);
        const coins = duration / 3600;
        get().gainLP(Math.round(duration / 60));
        set(s => ({
          elapsed: 0,
          timerPhase: nextPhase,
          pomDone: newPomDone,
          user: {
            ...s.user,
            xp: Math.min(s.user.xp + xp, s.user.xpMax),
            balance: parseFloat((s.user.balance + coins).toFixed(2)),
            todayHours: parseFloat((s.user.todayHours + duration / 3600).toFixed(2)),
            totalHours: parseFloat((s.user.totalHours + duration / 3600).toFixed(2)),
          }
        }));
      } else {
        set({ elapsed: 0, timerPhase: nextPhase });
      }
    } else {
      set({ elapsed: elapsed + 1 });
    }
  },
  setActiveSubject: (subject) => set({ activeSubject: subject }),
  setCustomWork: (v) => set({ customWork: v }),
  setCustomBreak: (v) => set({ customBreak: v }),
  dismissSessionComplete: () => set({ showSessionComplete: false }),
  setAmbientSound: (sound) => set({ ambientSound: sound }),
  setAmbientVolume: (v) => set({ ambientVolume: v }),

  // Tasks
  tasks: (mockTasks as Task[]),
  addTask: (name) => set(s => ({
    tasks: [...s.tasks, {
      id: `t${Date.now()}`,
      name,
      subject: 'Genel',
      subjectColor: '#7B5CF5',
      subjectEmoji: '📝',
      startTime: '20:00',
      endTime: '21:00',
      duration: 60,
      coins: 1,
      status: 'pending' as const,
      xp: 90,
    }]
  })),
  completeTask: (id) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'done' as const } : t)
  })),
  reorderTasks: (from, to) => set(s => {
    const tasks = [...s.tasks];
    const [item] = tasks.splice(from, 1);
    tasks.splice(to, 0, item);
    return { tasks };
  }),

  // Market
  items: (mockMarketItems as MarketItem[]),
  buyItem: (id) => {
    const { items, user, showToast } = get();
    const item = items.find(i => i.id === id);
    if (!item || item.owned) return false;
    const price = item.isDaily && item.dailyPrice ? item.dailyPrice : item.price;
    if (user.balance < price) {
      showToast(`Yetersiz bakiye. ${(price - user.balance).toFixed(1)} sa daha lazım.`, 'error', '❌');
      return false;
    }
    set(s => ({
      items: s.items.map(i => i.id === id ? { ...i, owned: true } : i),
      user: { ...s.user, balance: parseFloat((s.user.balance - price).toFixed(2)), collectionCount: s.user.collectionCount + 1 }
    }));
    showToast(`${item.emoji} ${item.name} senin oldu! Dolaba eklendi.`, 'success', '🎉');
    return true;
  },
  equipItem: (id) => {
    const { items, user } = get();
    const item = items.find(i => i.id === id);
    if (!item || !item.owned) return;
    const isEquipped = item.equipped;
    const equippedCostume = items.find(i => i.category === 'costume' && i.equipped);
    const costumeSlots = ['hat', 'top', 'bottom', 'shoes'] as const;

    set(s => {
      const newEquipped = { ...s.user.equippedItems };

      if (isEquipped) {
        // Toggle off
        if (item.category === 'costume') {
          costumeSlots.forEach(slot => { newEquipped[slot] = null; });
        } else {
          const slot = item.category as keyof typeof newEquipped;
          if (slot in newEquipped) newEquipped[slot] = null;
        }
        return {
          items: s.items.map(i => i.id === id ? { ...i, equipped: false } : i),
          user: { ...s.user, equippedItems: newEquipped },
        };
      }

      // Equipping
      if (item.category === 'costume') {
        costumeSlots.forEach(slot => { newEquipped[slot] = id; });
      } else {
        if (equippedCostume) {
          costumeSlots.forEach(slot => { newEquipped[slot] = null; });
        }
        const slot = item.category as keyof typeof newEquipped;
        if (slot in newEquipped) newEquipped[slot] = id;
      }

      return {
        items: s.items.map(i => {
          if (i.id === id) return { ...i, equipped: true };
          if (item.category === 'costume') {
            if (costumeSlots.includes(i.category as typeof costumeSlots[number]) && i.equipped) return { ...i, equipped: false };
            if (i.category === 'costume' && i.equipped) return { ...i, equipped: false };
          } else {
            if (i.category === 'costume' && i.equipped) return { ...i, equipped: false };
            if (i.category === item.category && i.equipped) return { ...i, equipped: false };
          }
          return i;
        }),
        user: { ...s.user, equippedItems: newEquipped },
      };
    });
  },
  unequipItem: (id) => set(s => ({ items: s.items.map(i => i.id === id ? { ...i, equipped: false } : i) })),
  marketCategory: 'all',
  marketSort: 'rarity',
  marketSearch: '',
  setMarketCategory: (c) => set({ marketCategory: c }),
  setMarketSort: (s) => set({ marketSort: s }),
  setMarketSearch: (s) => set({ marketSearch: s }),

  // Chat
  messages: mockChatMessages.map(m => ({ ...m })),
  activeChannel: 'gen',
  joinedRooms: [],
  voiceRooms: [...mockVoiceRooms],
  sendMessage: (text, replyTo) => {
    if (!text.trim()) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const channel = get().activeChannel;
    set(s => ({
      messages: [...s.messages, {
        id: `m${Date.now()}`,
        userId: 'u1',
        userName: s.user.name,
        userEmoji: s.user.emoji,
        userColor: '#7B5CF5',
        content: text,
        timestamp,
        channel,
        reactions: [],
        replyTo,
      }]
    }));
  },
  addReaction: (msgId, emoji) => set(s => ({
    messages: s.messages.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...m,
          reactions: m.reactions
            .map(r => r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r)
            .filter(r => r.count > 0)
        };
      }
      return { ...m, reactions: [...m.reactions, { emoji, count: 1, reacted: true }] };
    })
  })),
  setActiveChannel: (id) => set({ activeChannel: id }),
  joinRoom: (roomId) => set(s => ({
    joinedRooms: s.joinedRooms.includes(roomId) ? s.joinedRooms : [...s.joinedRooms, roomId],
    voiceRooms: s.voiceRooms.map(r => r.id === roomId ? { ...r, occupied: r.occupied + 1 } : r)
  })),
  leaveRoom: (roomId) => set(s => ({
    joinedRooms: s.joinedRooms.filter(id => id !== roomId),
    voiceRooms: s.voiceRooms.map(r => r.id === roomId ? { ...r, occupied: Math.max(0, r.occupied - 1) } : r)
  })),
  userStatus: 'studying',
  setUserStatus: (status) => set({ userStatus: status }),

  // Rando
  randoState: 'idle',
  randoOpponent: null,
  randoElapsed: 0,
  randoStars: 0,
  randoSubject: 'Matematik',
  randoDuration: 3600,
  randoFormat: 'silent',
  setRandoState: (state) => set({ randoState: state }),
  setRandoOpponent: (o) => set({ randoOpponent: o }),
  tickRando: () => set(s => ({ randoElapsed: s.randoElapsed + 1 })),
  setRandoStars: (n) => set({ randoStars: n }),
  completeRando: () => {
    const { randoElapsed } = get();
    const xp = Math.round((randoElapsed / 60) * XP_PER_MINUTE);
    const coins = 1.5;
    get().gainLP(Math.round(randoElapsed / 60));
    set(s => ({
      randoState: 'complete',
      user: {
        ...s.user,
        xp: Math.min(s.user.xp + xp, s.user.xpMax),
        balance: parseFloat((s.user.balance + coins).toFixed(2)),
      }
    }));
  },
  cancelRando: () => set({ randoState: 'idle', randoOpponent: null, randoElapsed: 0, randoStars: 0 }),
  setRandoSubject: (s) => set({ randoSubject: s }),
  setRandoDuration: (d) => set({ randoDuration: d }),
  setRandoFormat: (f) => set({ randoFormat: f }),

  // Tournaments
  tournaments: [...mockTournaments],
  joinTournament: (id) => set(s => ({
    tournaments: s.tournaments.map(t =>
      t.id === id
        ? { ...t, joined: !t.joined, participants: t.joined ? t.participants - 1 : t.participants + 1 }
        : t
    )
  })),
  expandedTournaments: [],
  toggleExpandTournament: (id) => set(s => ({
    expandedTournaments: s.expandedTournaments.includes(id)
      ? s.expandedTournaments.filter(x => x !== id)
      : [...s.expandedTournaments, id]
  })),

  // Notifications
  notifications: [...mockNotifications],
  addNotification: (n) => set(s => ({
    notifications: [{ ...n, id: `notif-${Date.now()}` }, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  unreadCount: mockNotifications.filter(n => !n.read).length,

  // Toasts
  toasts: [],
  showToast: (message, type = 'info', emoji) => {
    const id = `toast-${Date.now()}`;
    set(s => ({ toasts: [...s.toasts.slice(-2), { id, message, type, emoji }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // Plan
  planView: 'week',
  setPlanView: (v) => set({ planView: v }),
  planWeekOffset: 0,
  setPlanWeekOffset: (o) => set({ planWeekOffset: o }),

  // Profile
  profileTab: 'profile',
  setProfileTab: (t) => set({ profileTab: t }),

  // Rank
  gainLP: (minutesStudied) => {
    if (minutesStudied <= 0) return;
    const { user } = get();
    const lpGain = minutesStudied * LP_PER_MINUTE;
    let newLp = user.lp + lpGain;
    let newTier = user.rankTier;
    let newDivision = user.rankDivision;
    let promoted = false;
    let rankUpInfo: { newTier: string; newDivision: number } | null = null;
    const divToRoman = ['', 'I', 'II', 'III', 'IV'] as const;

    while (newLp >= 100 && newTier !== 'Usta') {
      newLp -= 100;
      if (newDivision > 1) {
        newDivision -= 1;
      } else {
        const idx = RANK_TIERS.indexOf(newTier as typeof RANK_TIERS[number]);
        if (idx < RANK_TIERS.length - 1) {
          newTier = RANK_TIERS[idx + 1];
          newDivision = 4;
        } else {
          // Already at Usta — stop
          break;
        }
      }
      promoted = true;
      rankUpInfo = { newTier, newDivision };
    }

    const newRank = newTier === 'Usta' ? 'Usta' : `${newTier} ${divToRoman[newDivision]}`;
    const newLpHistory = [...user.lpHistory, user.lp + lpGain].slice(-20);

    set(s => ({
      user: {
        ...s.user,
        lp: newLp,
        rankTier: newTier,
        rankDivision: newDivision,
        rank: newRank,
        lpHistory: newLpHistory,
        showRankUpModal: promoted,
        rankUpInfo,
      }
    }));
  },
  dismissRankUp: () => set(s => ({ user: { ...s.user, showRankUpModal: false, rankUpInfo: null } })),

  // Community posts
  communityPosts: mockCommunityPosts,
  createPost: (post) => set(s => ({
    communityPosts: [
      {
        ...post,
        id: `p${Date.now()}`,
        participants: ['me'],
        reactions: [],
        timestamp: 'Az önce',
      },
      ...s.communityPosts,
    ],
  })),
  joinChallenge: (postId) => set(s => ({
    communityPosts: s.communityPosts.map(p =>
      p.id === postId && !p.participants.includes('me')
        ? { ...p, participants: [...p.participants, 'me'] }
        : p
    ),
  })),
  addPostReaction: (postId, emoji) => set(s => ({
    communityPosts: s.communityPosts.map(p => {
      if (p.id !== postId) return p;
      const existing = p.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...p,
          reactions: p.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          ),
        };
      }
      return { ...p, reactions: [...p.reactions, { emoji, count: 1, reacted: true }] };
    }),
  })),

  // Task history
  taskHistory: mockTaskHistory,

  // Integration subjects
  integrationSubjects: mockIntegrationSubjects,

  // All subjects getter
  getAllSubjects: () => {
    const s = get();
    return [
      ...SUBJECTS,
      ...s.integrationSubjects.map(is => ({ id: is.id, name: is.name, emoji: is.emoji, color: is.color })),
    ];
  },

  // Lobby
  activeLobbyRoom: null,
  openLobby: (roomId) => set({ activeLobbyRoom: roomId }),
  closeLobby: () => set({ activeLobbyRoom: null }),
}));
