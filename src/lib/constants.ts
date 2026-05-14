export const SUBJECTS = [
  { id: 'mat', name: 'Matematik', emoji: '📐', color: '#7B5CF5' },
  { id: 'fiz', name: 'Fizik', emoji: '⚡', color: '#22D3EE' },
  { id: 'kim', name: 'Kimya', emoji: '⚗️', color: '#F59E0B' },
  { id: 'bio', name: 'Biyoloji', emoji: '🌿', color: '#10B981' },
  { id: 'edb', name: 'Edebiyat', emoji: '📖', color: '#EC4899' },
  { id: 'tyt', name: 'TYT', emoji: '📝', color: '#9D82F8' },
  { id: 'geo', name: 'Geometri', emoji: '📐', color: '#06B6D4' },
  { id: 'ing', name: 'İngilizce', emoji: '🌍', color: '#84CC16' },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]['id'];

export type TimerMode = 'pomodoro' | 'long' | 'custom' | 'free';
export type TimerPhase = 'work' | 'break';

export const TIMER_MODES: Record<TimerMode, { label: string; workDuration: number; breakDuration: number }> = {
  pomodoro: { label: '🍅 Pomodoro 25/5', workDuration: 25 * 60, breakDuration: 5 * 60 },
  long: { label: '🧘 Uzun 90dk', workDuration: 90 * 60, breakDuration: 15 * 60 },
  custom: { label: '⚙️ Özel', workDuration: 25 * 60, breakDuration: 5 * 60 },
  free: { label: '🌊 Serbest', workDuration: Infinity, breakDuration: 0 },
};

export const POMODORO_COUNT = 4;
export const LP_PER_MINUTE = 2;
export const XP_PER_MINUTE = 3;
export const COINS_PER_HOUR = 1;

export const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Yağmur', emoji: '🌧️' },
  { id: 'cafe', label: 'Kafe', emoji: '☕' },
  { id: 'ocean', label: 'Okyanus', emoji: '🌊' },
  { id: 'forest', label: 'Orman', emoji: '🌿' },
  { id: 'lofi', label: 'Lo-fi', emoji: '🎵' },
  { id: 'white', label: 'Beyaz Gürültü', emoji: '⬜' },
] as const;

export interface RankThreshold {
  name: string;
  emoji: string;
  minHours: number;
  maxHours: number;
  color: string;
}

export const RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'Kaşif',  emoji: '🌱', minHours: 0,   maxHours: 10,   color: '#64748B' },
  { name: 'Çırak',  emoji: '📖', minHours: 10,  maxHours: 50,   color: '#22D3EE' },
  { name: 'Öğrenci',emoji: '🎓', minHours: 50,  maxHours: 150,  color: '#A78BFA' },
  { name: 'Bilge',  emoji: '🦉', minHours: 150, maxHours: 400,  color: '#F59E0B' },
  { name: 'Üstat',  emoji: '⚔️', minHours: 400, maxHours: 800,  color: '#F97316' },
  { name: 'Efsane', emoji: '🌟', minHours: 800, maxHours: Infinity, color: '#FFD700' },
];

export const RANK_TIERS = ['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta'] as const;
export type RankTier = (typeof RANK_TIERS)[number];

export const RANK_TIER_COLORS: Record<string, string> = {
  Demir:  '#7C7C7C',
  Bronz:  '#CD7F32',
  Gümüş:  '#C0C0C0',
  Altın:  '#FFD700',
  Platin: '#4DD8D3',
  Elmas:  '#B9F2FF',
  Usta:   '#8B5CF6',
};

export const RANK_TIER_EMOJIS: Record<string, string> = {
  Demir:  '⛏️',
  Bronz:  '🥉',
  Gümüş:  '🥈',
  Altın:  '🥇',
  Platin: '💠',
  Elmas:  '💎',
  Usta:   '👑',
};

export const TABS = [
  { id: 'dashboard',  label: '⌂ DASHBOARD' },
  { id: 'timer',      label: '⏱ TİMER' },
  { id: 'plan',       label: '🗺 PLAN' },
  { id: 'avatar',     label: '🐾 AVATAR' },
  { id: 'market',     label: '🛒 MARKET' },
  { id: 'community',  label: '💬 TOPLULUK' },
  { id: 'tournament', label: '⚔ TURNUVA' },
  { id: 'rando',      label: '🤝 RANDO' },
  { id: 'leaderboard',label: '🏆 SIRALA' },
  { id: 'analytics',  label: '📊 ANALİTİK' },
  { id: 'profile',    label: '👤 PROFİL' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export interface DailyQuote {
  text: string;
  author: string;
  initials: string;
  color: string;
}

export const DAILY_QUOTES: DailyQuote[] = [
  { text: 'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.', author: 'Robert Collier', initials: 'RC', color: '#7B5CF5' },
  { text: 'Bilgi güçtür, ama uyguladığın bilgi özgürlüktür.', author: 'Francis Bacon', initials: 'FB', color: '#22D3EE' },
  { text: 'Zorlu olan şeyleri deneyin; kolaylar sizi büyütmez.', author: 'Marcus Aurelius', initials: 'MA', color: '#F59E0B' },
  { text: 'Her uzman, bir zamanlar acemi birisiydi.', author: 'Helen Hayes', initials: 'HH', color: '#10B981' },
  { text: 'Bugün yapabileceğini yarına bırakma.', author: 'Benjamin Franklin', initials: 'BF', color: '#EF4444' },
  { text: 'Başlamak, yarının başarısının yarısıdır.', author: 'Aristoteles', initials: 'AR', color: '#A78BFA' },
  { text: 'Disiplin, tutku ile hedef arasındaki köprüdür.', author: 'Jim Rohn', initials: 'JR', color: '#EC4899' },
  { text: 'Zekâ çalışmadan bir sonuç vermez.', author: 'Albert Einstein', initials: 'AE', color: '#F97316' },
  { text: 'Her büyük başarı, bir zamanlar imkânsız görünüyordu.', author: 'Nelson Mandela', initials: 'NM', color: '#84CC16' },
  { text: 'Öğrenmek bir hazinedir; sahibine her yerde eşlik eder.', author: 'Çin Atasözü', initials: 'ÇA', color: '#06B6D4' },
];
