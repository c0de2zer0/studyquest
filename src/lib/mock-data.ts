// src/lib/mock-data.ts
export const mockUser = {
  id: 'u1',
  name: 'Shadow Fox',
  emoji: '🦊',
  level: 14,
  xp: 3420,
  xpMax: 5000,
  balance: 212.5,
  streak: 23,
  totalHours: 247,
  rank: 'Altın IV',
  rankEmoji: '🥇',
  lp: 45,
  rankTier: 'Altın',
  rankDivision: 4,
  lpHistory: [] as number[],
  showRankUpModal: false,
  rankUpInfo: null as { newTier: string; newDivision: number } | null,
  bio: 'YKS hazırlık · Matematik ❤️ · Hedef: 600 sa',
  joinDate: 'Eylül 2024',
  followers: 34,
  following: 21,
  friends: 12,
  collectionCount: 12,
  collectionTotal: 30,
  status: 'studying' as 'online'|'studying'|'break'|'dnd'|'offline',
  avatar: {
    currentForm: '🦊',
    tier: 'Tilki Evrimi',
    rarity: 'Nadir',
    glowColor: '#7B5CF5',
  },
  stats: {
    focus: 78,
    speed: 65,
    endurance: 82,
    memory: 71,
  },
  equippedItems: {
    hat: 'item-hat-2' as string | null,
    top: null as string | null,
    bottom: null as string | null,
    shoes: null as string | null,
    hair: null as string | null,
    accessory: 'item-acc-1' as string | null,
    background: null as string | null,
  },
  featuredBadges: ['badge-first-blood', 'badge-speed-learner', 'badge-7-streak'],
  featuredItems: ['item-hat-2', 'item-acc-1'],
  weeklyXp: 6920,
  weeklyXpPrev: 5400,
  todayHours: 4.2,
  dailyGoal: 6,
  examDaysLeft: 89,
  examGoalHours: 600,
};

export const mockTasks = [
  { id: 't1', name: 'Türev ve İntegral', subject: 'Matematik', subjectColor: '#7B5CF5', subjectEmoji: '📐', startTime: '09:00', endTime: '11:00', duration: 120, coins: 2, status: 'done' as const, xp: 180 },
  { id: 't2', name: 'Elektrik Devreleri', subject: 'Fizik', subjectColor: '#22D3EE', subjectEmoji: '⚡', startTime: '11:30', endTime: '13:00', duration: 90, coins: 1.5, status: 'active' as const, xp: 135, elapsed: 2340 },
  { id: 't3', name: 'Organik Kimya', subject: 'Kimya', subjectColor: '#F59E0B', subjectEmoji: '⚗️', startTime: '14:00', endTime: '15:30', duration: 90, coins: 1.5, status: 'pending' as const, xp: 135 },
  { id: 't4', name: 'Hücre Bölünmesi', subject: 'Biyoloji', subjectColor: '#10B981', subjectEmoji: '🌿', startTime: '16:00', endTime: '17:00', duration: 60, coins: 1, status: 'pending' as const, xp: 90 },
  { id: 't5', name: 'Şiir Analizi', subject: 'Edebiyat', subjectColor: '#EC4899', subjectEmoji: '📖', startTime: '17:30', endTime: '18:30', duration: 60, coins: 1, status: 'pending' as const, xp: 90 },
];

export const mockFriends = [
  { id: 'f1', name: 'NightWolf', emoji: '🐺', level: 16, status: 'studying', statusText: 'Matematik çalışıyor · 1sa 20dk', statusColor: '#10B981', online: true },
  { id: 'f2', name: 'StarGazer', emoji: '⭐', level: 11, status: 'break', statusText: 'Mola – 8 dk önce', statusColor: '#F59E0B', online: true },
  { id: 'f3', name: 'IronMind', emoji: '🧠', level: 19, status: 'dnd', statusText: 'Rahatsız etme modu', statusColor: '#EF4444', online: true },
  { id: 'f4', name: 'DawnRider', emoji: '🌅', level: 8, status: 'offline', statusText: '2 saat önce çevrimiçiydi', statusColor: '#64748B', online: false },
];

export const mockLeaderboard = [
  { rank: 1, name: 'Ahmet K.', emoji: '🦁', level: 22, score: 9840, xp: 9840, trend: 0, totalHours: 412 },
  { rank: 2, name: 'Zeynep A.', emoji: '🌸', level: 20, score: 8720, xp: 8720, trend: 1, totalHours: 389 },
  { rank: 3, name: 'Burak T.', emoji: '⚡', level: 18, score: 7650, xp: 7650, trend: -1, totalHours: 354 },
  { rank: 4, name: 'Elif M.', emoji: '🔥', level: 17, score: 7200, xp: 7200, trend: 2, totalHours: 312 },
  { rank: 5, name: 'Shadow Fox', emoji: '🦊', level: 14, score: 6920, xp: 6920, trend: 2, totalHours: 247, isMe: true },
  { rank: 6, name: 'CyberSage', emoji: '🧙', level: 15, score: 6540, xp: 6540, trend: -1, totalHours: 298 },
  { rank: 7, name: 'MoonChild', emoji: '🌙', level: 13, score: 6120, xp: 6120, trend: 0, totalHours: 234 },
  { rank: 8, name: 'TechNinja', emoji: '🥷', level: 12, score: 5890, xp: 5890, trend: 1, totalHours: 221 },
];

export const mockMarketItems = [
  // Hats
  { id: 'item-hat-1', name: 'Cyber Kask', category: 'hat', emoji: '⛑️', rarity: 'common', price: 15, owned: true, equipped: false },
  { id: 'item-hat-2', name: 'Neon Şapka', category: 'hat', emoji: '🎩', rarity: 'rare', price: 45, owned: true, equipped: true },
  { id: 'item-hat-3', name: 'Hologram Başlık', category: 'hat', emoji: '👑', rarity: 'epic', price: 120, owned: false, equipped: false },
  { id: 'item-hat-4', name: 'Efsanevi Korona', category: 'hat', emoji: '💎', rarity: 'legendary', price: 500, owned: false, equipped: false },
  // Tops
  { id: 'item-top-1', name: 'Okul Ceketi', category: 'top', emoji: '🧥', rarity: 'common', price: 20, owned: false, equipped: false },
  { id: 'item-top-2', name: 'Akademi Üniforma', category: 'top', emoji: '👔', rarity: 'rare', price: 60, owned: false, equipped: false },
  { id: 'item-top-3', name: 'Çalışma Yelegi', category: 'top', emoji: '🦺', rarity: 'epic', price: 150, owned: false, equipped: false },
  // Accessories
  { id: 'item-acc-1', name: 'XP Halkası', category: 'accessory', emoji: '💍', rarity: 'rare', price: 80, owned: true, equipped: true },
  { id: 'item-acc-2', name: 'Zaman Gözlüğü', category: 'accessory', emoji: '🥽', rarity: 'epic', price: 200, owned: false, equipped: false },
  { id: 'item-acc-3', name: 'Kuantum Kolye', category: 'accessory', emoji: '📿', rarity: 'legendary', price: 600, owned: false, equipped: false },
  // Backgrounds
  { id: 'item-bg-1', name: 'Galaksi', category: 'background', emoji: '🌌', rarity: 'rare', price: 100, owned: false, equipped: false },
  { id: 'item-bg-2', name: 'Neon Şehir', category: 'background', emoji: '🌆', rarity: 'epic', price: 250, owned: false, equipped: false },
  // Special
  { id: 'item-special-1', name: 'DNA Kanadı', category: 'top', emoji: '🧬', rarity: 'legendary', price: 1500, owned: false, equipped: false, isDaily: true, dailyPrice: 1050 },
  // More Hats
  { id: 'item-hat-5', name: 'Piksel Kask', category: 'hat', emoji: '⛑️', rarity: 'common', price: 20, owned: false, equipped: false },
  { id: 'item-hat-6', name: 'Ninja Bandanası', category: 'hat', emoji: '🥷', rarity: 'rare', price: 65, owned: false, equipped: false },
  { id: 'item-hat-7', name: 'Zaman Tacı', category: 'hat', emoji: '👁️', rarity: 'epic', price: 200, owned: false, equipped: false },
  { id: 'item-hat-8', name: 'Tanrı Halosu', category: 'hat', emoji: '😇', rarity: 'legendary', price: 750, owned: false, equipped: false },
  // Hair
  { id: 'item-hair-1', name: 'Kısa Saç', category: 'hair', emoji: '💈', rarity: 'common', price: 15, owned: false, equipped: false },
  { id: 'item-hair-2', name: 'Anime Saçı', category: 'hair', emoji: '🌀', rarity: 'rare', price: 55, owned: false, equipped: false },
  { id: 'item-hair-3', name: 'Neon Örgü', category: 'hair', emoji: '🎀', rarity: 'rare', price: 70, owned: false, equipped: false },
  { id: 'item-hair-4', name: 'Uzun Dalgalı', category: 'hair', emoji: '🌊', rarity: 'epic', price: 160, owned: false, equipped: false },
  { id: 'item-hair-5', name: 'Hologram Peruk', category: 'hair', emoji: '✨', rarity: 'epic', price: 220, owned: false, equipped: false },
  { id: 'item-hair-6', name: 'Efsanevi Alev Saçı', category: 'hair', emoji: '🔥', rarity: 'legendary', price: 600, owned: false, equipped: false },
  // More Tops
  { id: 'item-top-4', name: 'Kodlayıcı Hoodie', category: 'top', emoji: '👕', rarity: 'common', price: 25, owned: false, equipped: false },
  { id: 'item-top-5', name: 'Neon Zırh', category: 'top', emoji: '🦺', rarity: 'rare', price: 90, owned: false, equipped: false },
  { id: 'item-top-6', name: 'Kuantum Ceket', category: 'top', emoji: '🧥', rarity: 'epic', price: 280, owned: false, equipped: false },
  { id: 'item-top-7', name: 'Ejderha Zırhı', category: 'top', emoji: '🐉', rarity: 'legendary', price: 900, owned: false, equipped: false },
  // Bottom
  { id: 'item-bottom-1', name: 'Kargo Pantolon', category: 'bottom', emoji: '👖', rarity: 'common', price: 20, owned: false, equipped: false },
  { id: 'item-bottom-2', name: 'Neon Tayt', category: 'bottom', emoji: '🩲', rarity: 'rare', price: 60, owned: false, equipped: false },
  { id: 'item-bottom-3', name: 'Siber Şort', category: 'bottom', emoji: '🩳', rarity: 'rare', price: 75, owned: false, equipped: false },
  { id: 'item-bottom-4', name: 'Zırh Etek', category: 'bottom', emoji: '🥋', rarity: 'epic', price: 175, owned: false, equipped: false },
  { id: 'item-bottom-5', name: 'Hologram Pantolon', category: 'bottom', emoji: '💠', rarity: 'epic', price: 250, owned: false, equipped: false },
  { id: 'item-bottom-6', name: 'Ejderha Bacakları', category: 'bottom', emoji: '🐲', rarity: 'legendary', price: 650, owned: false, equipped: false },
  // Shoes
  { id: 'item-shoes-1', name: 'Spor Ayakkabı', category: 'shoes', emoji: '👟', rarity: 'common', price: 18, owned: false, equipped: false },
  { id: 'item-shoes-2', name: 'Neon Koşucular', category: 'shoes', emoji: '🏃', rarity: 'rare', price: 55, owned: false, equipped: false },
  { id: 'item-shoes-3', name: 'Lazer Botlar', category: 'shoes', emoji: '🥾', rarity: 'rare', price: 80, owned: false, equipped: false },
  { id: 'item-shoes-4', name: 'Siber Çizmeler', category: 'shoes', emoji: '👢', rarity: 'epic', price: 190, owned: false, equipped: false },
  { id: 'item-shoes-5', name: 'Uçuş Botları', category: 'shoes', emoji: '🚀', rarity: 'epic', price: 320, owned: false, equipped: false },
  { id: 'item-shoes-6', name: 'Tanrı Sandalet', category: 'shoes', emoji: '⚡', rarity: 'legendary', price: 700, owned: false, equipped: false },
  // More Accessories
  { id: 'item-acc-4', name: 'Lazer Gözlük', category: 'accessory', emoji: '🕶️', rarity: 'common', price: 35, owned: false, equipped: false },
  { id: 'item-acc-5', name: 'Hologram Küpe', category: 'accessory', emoji: '🔮', rarity: 'rare', price: 70, owned: false, equipped: false },
  { id: 'item-acc-6', name: 'Zaman Bilekliği', category: 'accessory', emoji: '⌚', rarity: 'rare', price: 85, owned: false, equipped: false },
  { id: 'item-acc-7', name: 'Kuantum Kalkan', category: 'accessory', emoji: '🛡️', rarity: 'epic', price: 220, owned: false, equipped: false },
  { id: 'item-acc-8', name: 'Tanrı Eldivenler', category: 'accessory', emoji: '🧤', rarity: 'legendary', price: 850, owned: false, equipped: false },
  // More Backgrounds
  { id: 'item-bg-3', name: 'Siber Orman', category: 'background', emoji: '🌲', rarity: 'common', price: 30, owned: false, equipped: false },
  { id: 'item-bg-4', name: 'Dijital Okyanus', category: 'background', emoji: '🌊', rarity: 'rare', price: 90, owned: false, equipped: false },
  { id: 'item-bg-5', name: 'Neon Dağlar', category: 'background', emoji: '⛰️', rarity: 'rare', price: 110, owned: false, equipped: false },
  { id: 'item-bg-6', name: 'Uzay İstasyonu', category: 'background', emoji: '🛸', rarity: 'epic', price: 260, owned: false, equipped: false },
  { id: 'item-bg-7', name: 'Ejderha Şatosu', category: 'background', emoji: '🏰', rarity: 'epic', price: 300, owned: false, equipped: false },
  { id: 'item-bg-8', name: 'Matrix Boyutu', category: 'background', emoji: '💻', rarity: 'legendary', price: 950, owned: false, equipped: false },
  // Costumes
  { id: 'item-costume-1', name: 'Ejderha Şövalye Seti', category: 'costume', emoji: '🐉', rarity: 'legendary', price: 800, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-1', top: 'item-top-costume-1', bottom: 'item-bottom-costume-1', shoes: 'item-shoes-costume-1' } },
  { id: 'item-costume-2', name: 'Neon Savaşçı Seti', category: 'costume', emoji: '⚔️', rarity: 'epic', price: 350, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-2', top: 'item-top-costume-2', bottom: 'item-bottom-costume-2', shoes: 'item-shoes-costume-2' } },
  { id: 'item-costume-3', name: 'Cyber Punk Seti', category: 'costume', emoji: '🤖', rarity: 'epic', price: 380, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-3', top: 'item-top-costume-3', bottom: 'item-bottom-costume-3', shoes: 'item-shoes-costume-3' } },
  { id: 'item-costume-4', name: 'Ninja Karanlık Seti', category: 'costume', emoji: '🥷', rarity: 'rare', price: 140, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-4', top: 'item-top-costume-4', bottom: 'item-bottom-costume-4', shoes: 'item-shoes-costume-4' } },
  { id: 'item-costume-5', name: 'Uzay Gezgini Seti', category: 'costume', emoji: '🚀', rarity: 'legendary', price: 950, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-5', top: 'item-top-costume-5', bottom: 'item-bottom-costume-5', shoes: 'item-shoes-costume-5' } },
  { id: 'item-costume-6', name: 'Piksel Kahraman Seti', category: 'costume', emoji: '🦸', rarity: 'common', price: 45, owned: false, equipped: false, costumeSlots: { hat: 'item-hat-costume-6', top: 'item-top-costume-6', bottom: 'item-bottom-costume-6', shoes: 'item-shoes-costume-6' } },
];

export const mockChatMessages = [
  { id: 'm1', userId: 'f1', userName: 'NightWolf', userEmoji: '🐺', userColor: '#22D3EE', content: 'Bugün türev soruları için harika bir kaynak buldum 📚', timestamp: '10:23', channel: 'gen', reactions: [{ emoji: '👍', count: 4 }, { emoji: '🔥', count: 2 }] },
  { id: 'm2', userId: 'f2', userName: 'StarGazer', userEmoji: '⭐', userColor: '#F59E0B', content: 'Hangi kaynak? Paylaşır mısın?', timestamp: '10:24', channel: 'gen', reactions: [] },
  { id: 'm3', userId: 'f1', userName: 'NightWolf', userEmoji: '🐺', userColor: '#22D3EE', content: 'Hocalara gelen sorular kitabı, çok kaliteli. YKS için birebir', timestamp: '10:25', channel: 'gen', reactions: [{ emoji: '❤️', count: 3 }] },
  { id: 'm4', userId: 'f3', userName: 'IronMind', userEmoji: '🧠', userColor: '#A78BFA', content: '🏆 Ahmet haftalık sıralamada 1. sıraya yükseldi!', timestamp: '10:30', channel: 'gen', isSystem: true, reactions: [] },
  { id: 'm5', userId: 'u1', userName: 'Shadow Fox', userEmoji: '🦊', userColor: '#7B5CF5', content: 'Tebrikler! Ben de bugün 4 saat çalıştım, hedefe yaklaşıyorum', timestamp: '10:31', channel: 'gen', reactions: [{ emoji: '💪', count: 2 }] },
  { id: 'm6', userId: 'f4', userName: 'DawnRider', userEmoji: '🌅', userColor: '#10B981', content: 'Kimya organik kısmını bitirdim sonunda! Bu hafta fizik var', timestamp: '10:45', channel: 'gen', reactions: [{ emoji: '✅', count: 5 }] },
  { id: 'm7', userId: 'f2', userName: 'StarGazer', userEmoji: '⭐', userColor: '#F59E0B', content: 'Türev + integral kombo çalışması yapalım mı akşam? Rando ile', timestamp: '11:00', channel: 'gen', reactions: [{ emoji: '👍', count: 3 }, { emoji: '🔥', count: 1 }] },
  { id: 'm8', userId: 'u1', userName: 'Shadow Fox', userEmoji: '🦊', userColor: '#7B5CF5', content: 'Ben varım! Akşam 8 olur mu?', timestamp: '11:02', channel: 'gen', reactions: [] },
];

export const mockChannels = [
  { id: 'mat', name: 'yks-matematik', category: 'lessons', unread: 0 },
  { id: 'fiz', name: 'yks-fizik', category: 'lessons', unread: 0 },
  { id: 'kim', name: 'yks-kimya', category: 'lessons', unread: 0 },
  { id: 'bio', name: 'yks-biyoloji', category: 'lessons', unread: 0 },
  { id: 'eng', name: 'yks-ingilizce', category: 'lessons', unread: 0 },
  { id: 'kpss', name: 'kpss-genel', category: 'lessons', unread: 0 },
  { id: 'gen', name: 'genel-sohbet', category: 'general', unread: 5 },
  { id: 'mot', name: 'motivasyon', category: 'general', unread: 0 },
  { id: 'bas', name: 'basari-paylasim', category: 'general', unread: 0 },
  { id: 'soru', name: 'soru-cevap', category: 'general', unread: 3 },
];

export const mockVoiceRooms = [
  { id: 'r1', name: 'Lo-fi Çalışma', emoji: '🎧', capacity: 20, occupied: 12 },
  { id: 'r2', name: 'Sessiz Odak', emoji: '🔇', capacity: 15, occupied: 8 },
  { id: 'r3', name: 'Kafe Ortamı', emoji: '☕', capacity: 10, occupied: 5 },
  { id: 'r4', name: 'Sınav Öncesi', emoji: '📅', capacity: 10, occupied: 3 },
];

export const mockOnlineMembers = [
  { id: 'f1', name: 'NightWolf', emoji: '🐺', level: 16, status: 'studying', statusText: 'Matematik çalışıyor', color: '#22D3EE' },
  { id: 'f2', name: 'StarGazer', emoji: '⭐', level: 11, status: 'break', statusText: 'Mola', color: '#F59E0B' },
  { id: 'f3', name: 'IronMind', emoji: '🧠', level: 19, status: 'dnd', statusText: 'Rahatsız etme', color: '#A78BFA' },
  { id: 'u3', name: 'CyberSage', emoji: '🧙', level: 15, status: 'studying', statusText: 'Fizik çalışıyor', color: '#22D3EE' },
  { id: 'u4', name: 'MoonChild', emoji: '🌙', level: 13, status: 'online', statusText: 'Çevrimiçi', color: '#94A3B8' },
  { id: 'u5', name: 'TechNinja', emoji: '🥷', level: 12, status: 'studying', statusText: 'Kimya çalışıyor', color: '#22D3EE' },
];

export const mockTournaments = [
  { id: 'tr1', emoji: '🏃', name: 'Haftalık Maraton', rule: '7 gün en fazla toplam saat', status: 'active', color: '#7B5CF5', prize: '+10 sa + Nadir eşya', participants: 1247, timeLeft: '3G 14S', joined: true, myRank: 5 },
  { id: 'tr2', emoji: '⚡', name: 'Sprint Challenge', rule: '24 saat en fazla görev', status: 'tomorrow', color: '#22D3EE', prize: '+5 sa + Siber Rozet', participants: 834, timeLeft: 'Yarın', joined: false, myRank: null },
  { id: 'tr3', emoji: '🥊', name: 'Ders Düellosu', rule: '3 gün seçili derste kim çok', status: 'open', color: '#F59E0B', prize: '+3 sa + Düello Rozeti', participants: 456, timeLeft: 'Açık', joined: false, myRank: null },
  { id: 'tr4', emoji: '👥', name: 'Takım Turnuvası', rule: '7 gün 5 kişilik takım toplam saati', status: 'soon', color: '#10B981', prize: '+15 sa takıma', participants: 312, timeLeft: '3G Sonra', joined: false, myRank: null },
  { id: 'tr5', emoji: '👑', name: 'Aylık Şampiyona', rule: '30 gün genel sıralama', status: 'upcoming', color: '#64748B', prize: '+50 sa + Efsane eşya', participants: 2891, timeLeft: '12G Sonra', joined: false, myRank: null },
];

export const mockWeeklyCalendar: Record<string, Array<{id:string; subject:string; color:string; emoji:string; start:number; end:number; task:string; completed:boolean}>> = {
  Mon: [
    { id: 'wc1', subject: 'Matematik', color: '#7B5CF5', emoji: '📐', start: 9, end: 11, task: 'Türev ve İntegral', completed: true },
    { id: 'wc2', subject: 'Fizik', color: '#22D3EE', emoji: '⚡', start: 14, end: 15.5, task: 'Elektrik Devreleri', completed: false },
  ],
  Tue: [
    { id: 'wc3', subject: 'Kimya', color: '#F59E0B', emoji: '⚗️', start: 10, end: 12, task: 'Organik Kimya', completed: false },
    { id: 'wc4', subject: 'Biyoloji', color: '#10B981', emoji: '🌿', start: 15, end: 16.5, task: 'Hücre Bölünmesi', completed: false },
  ],
  Wed: [
    { id: 'wc5', subject: 'Matematik', color: '#7B5CF5', emoji: '📐', start: 9, end: 11, task: 'Geometri', completed: true },
    { id: 'wc6', subject: 'Edebiyat', color: '#EC4899', emoji: '📖', start: 13, end: 14.5, task: 'Şiir Analizi', completed: true },
  ],
  Thu: [
    { id: 'wc7', subject: 'Fizik', color: '#22D3EE', emoji: '⚡', start: 10, end: 12, task: 'Manyetizma', completed: false },
    { id: 'wc8', subject: 'Matematik', color: '#7B5CF5', emoji: '📐', start: 14, end: 16, task: 'Olasılık', completed: false },
  ],
  Fri: [
    { id: 'wc9', subject: 'Kimya', color: '#F59E0B', emoji: '⚗️', start: 9, end: 11, task: 'Denge ve Asitler', completed: false },
    { id: 'wc10', subject: 'Biyoloji', color: '#10B981', emoji: '🌿', start: 14, end: 15, task: 'Genetik', completed: false },
  ],
  Sat: [
    { id: 'wc11', subject: 'Matematik', color: '#7B5CF5', emoji: '📐', start: 9, end: 12, task: 'Soru Çözme Maratonu', completed: false },
    { id: 'wc12', subject: 'Fizik', color: '#22D3EE', emoji: '⚡', start: 14, end: 17, task: 'Soru Çözme Maratonu', completed: false },
  ],
  Sun: [
    { id: 'wc13', subject: 'Biyoloji', color: '#10B981', emoji: '🌿', start: 10, end: 12, task: 'Hafta Sonu Tekrar', completed: false },
    { id: 'wc14', subject: 'Edebiyat', color: '#EC4899', emoji: '📖', start: 14, end: 16, task: 'Kompozisyon', completed: false },
  ],
};

export const mockNotifications = [
  { id: 'n1', type: 'mention', text: 'NightWolf seni etiketledi: @ShadowFox Matematik sorusu var', time: '5 dk önce', read: false, emoji: '🐺' },
  { id: 'n2', type: 'tournament', text: 'Haftalık Maraton bitti! Sen 5. sıraya girdin.', time: '1 sa önce', read: false, emoji: '⚔️' },
  { id: 'n3', type: 'friend', text: 'StarGazer seni takip etmeye başladı', time: '2 sa önce', read: true, emoji: '⭐' },
  { id: 'n4', type: 'achievement', text: 'Yeni rozet: "23 Günlük Seri" kazandın!', time: '3 sa önce', read: true, emoji: '🔥' },
];

export const mockBadges = [
  { id: 'badge-first-blood', emoji: '🏆', name: 'FIRST BLOOD', description: 'İlk seansını tamamladın', unlocked: true, date: 'Eylül 2024' },
  { id: 'badge-speed-learner', emoji: '⚡', name: 'SPEED LEARNER', description: 'Bir günde 5 görev tamamladın', unlocked: true, date: 'Ekim 2024' },
  { id: 'badge-7-streak', emoji: '💎', name: '7 GÜN SERİ', description: '7 gün üst üste çalıştın', unlocked: true, date: 'Kasım 2024' },
  { id: 'badge-night-owl', emoji: '🌿', name: 'GECE BAYKUŞU', description: 'Gece 00:00 sonrası 2 saat çalıştın', unlocked: true, date: 'Kasım 2024' },
  { id: 'badge-perfectionist', emoji: '🎯', name: 'PERFEKSİYONİST', description: 'Bir haftayı %100 tamamladın', unlocked: true, date: 'Aralık 2024' },
  { id: 'badge-early-bird', emoji: '🌸', name: 'SABAH KUŞU', description: 'Sabah 07:00 öncesi çalışmaya başladın', unlocked: true, date: 'Aralık 2024' },
  { id: 'badge-marathon', emoji: '🔒', name: '???', description: 'Bir ayda 100 saat çalış', unlocked: false, condition: 'Aylık 100 saat çalış' },
  { id: 'badge-legend', emoji: '🔒', name: '???', description: 'Efsane rütbesine ulaş', unlocked: false, condition: '800+ saat toplam' },
  { id: 'badge-social', emoji: '🔒', name: '???', description: 'Toplulukta aktif ol', unlocked: false, condition: '100 mesaj gönder' },
  { id: 'badge-rando-100', emoji: '🔒', name: '???', description: 'Rando seanslarında ustalaş', unlocked: false, condition: '50 Rando seansı tamamla' },
  { id: 'badge-tournament', emoji: '🔒', name: '???', description: 'Turnuva şampiyonu ol', unlocked: false, condition: 'Herhangi bir turnuvada 1. ol' },
  { id: 'badge-collector', emoji: '🔒', name: '???', description: 'Market koleksiyonu yap', unlocked: false, condition: '20 eşya satın al' },
];

// Analytics data - last 30 days
export const mockDailyHours: number[] = [
  3.2, 4.5, 2.8, 5.1, 4.8, 3.9, 6.2, 5.5, 4.1, 3.7,
  5.8, 6.1, 4.4, 3.2, 5.0, 4.7, 6.3, 5.2, 4.8, 3.9,
  5.5, 6.0, 4.2, 5.8, 3.6, 4.9, 5.7, 6.2, 4.5, 4.2
];

// Heatmap data - 6 months (182 days), 0-8 scale
export const mockHeatmapData: number[] = Array.from({ length: 182 }, (_, i) => {
  if (i > 170) return Math.floor(Math.random() * 5);
  return Math.random() > 0.2 ? Math.floor(Math.random() * 6) : 0;
});

export const mockSubjectDistribution = [
  { subject: 'Matematik', pct: 36, color: '#7B5CF5' },
  { subject: 'Fizik', pct: 22, color: '#22D3EE' },
  { subject: 'Kimya', pct: 17, color: '#F59E0B' },
  { subject: 'Biyoloji', pct: 14, color: '#10B981' },
  { subject: 'Diğer', pct: 11, color: '#64748B' },
];

export const mockEvolutionTree = [
  { id: 'ev1', emoji: '🐾', name: 'Pençe', reqHours: 0, unlocked: true, current: false },
  { id: 'ev2', emoji: '🦝', name: 'Rakun', reqHours: 10, unlocked: true, current: false },
  { id: 'ev3', emoji: '🦊', name: 'Tilki', reqHours: 50, unlocked: true, current: true },
  { id: 'ev4', emoji: '🐺', name: 'Kurt', reqHours: 150, unlocked: false, current: false },
  { id: 'ev5', emoji: '🦁', name: 'Aslan', reqHours: 300, unlocked: false, current: false },
  { id: 'ev6', emoji: '🐉', name: 'Ejder', reqHours: 500, unlocked: false, current: false },
  { id: 'ev7', emoji: '🌟', name: 'Efsane', reqHours: 800, unlocked: false, current: false },
];

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  type: 'post' | 'challenge';
  content: string;
  subject?: string;
  subjectColor?: string;
  durationMin?: number;
  participants: string[];
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  timestamp: string;
}

export interface TaskHistoryEntry {
  date: string;
  done: number;
  total: number;
}

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'p1', userId: 'u2', userName: 'NightWolf', userEmoji: '🐺', userColor: '#7B5CF5',
    type: 'challenge', content: 'Kim benimle matematik kafası yapıyor? 1 saat sprint!',
    subject: 'Matematik', subjectColor: '#7B5CF5', durationMin: 60,
    participants: ['u2', 'u3'], reactions: [{ emoji: '🔥', count: 12 }, { emoji: '💪', count: 8 }],
    timestamp: '2 dk önce',
  },
  {
    id: 'p2', userId: 'u4', userName: 'CyberSage', userEmoji: '🧠', userColor: '#22D3EE',
    type: 'post', content: 'Fizik sorusunu sonunda çözdüm! Elektrik devreleri artık kafamda net.',
    participants: [], reactions: [{ emoji: '🎉', count: 15 }, { emoji: '❤️', count: 6 }],
    timestamp: '15 dk önce',
  },
  {
    id: 'p3', userId: 'u5', userName: 'StarGazer', userEmoji: '⭐', userColor: '#F59E0B',
    type: 'challenge', content: '30 dakika kimya çalışma odası açıyorum, gelin!',
    subject: 'Kimya', subjectColor: '#F59E0B', durationMin: 30,
    participants: ['u5', 'u6', 'u7'], reactions: [{ emoji: '⚗️', count: 5 }],
    timestamp: '22 dk önce',
  },
  {
    id: 'p4', userId: 'u6', userName: 'IronMind', userEmoji: '🏆', userColor: '#10B981',
    type: 'post', content: 'Bu hafta 30 saat geçti, yeni rekor! Rank atlıyorum galiba 😤',
    participants: [], reactions: [{ emoji: '🔥', count: 24 }, { emoji: '👑', count: 11 }],
    timestamp: '1 sa önce',
  },
  {
    id: 'p5', userId: 'u7', userName: 'MoonChild', userEmoji: '🌙', userColor: '#A78BFA',
    type: 'challenge', content: '2 saatlik biyoloji maratonu — sadece kararlılar gelsin',
    subject: 'Biyoloji', subjectColor: '#10B981', durationMin: 120,
    participants: ['u7'], reactions: [{ emoji: '🌿', count: 3 }],
    timestamp: '2 sa önce',
  },
  {
    id: 'p6', userId: 'u8', userName: 'TechNinja', userEmoji: '🥷', userColor: '#EF4444',
    type: 'post', content: 'YKS ye 47 gün kaldı. Hâlâ burada miyiz? Evet. Devam.',
    participants: [], reactions: [{ emoji: '💀', count: 31 }, { emoji: '😤', count: 19 }],
    timestamp: '3 sa önce',
  },
];

export const mockTaskHistory: TaskHistoryEntry[] = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 7 + 3;
  const total = (seed % 3) + 3;
  const done = Math.min(total, Math.round(total * ((seed % 10) / 10 + 0.3)));
  const d = new Date('2026-03-19');
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split('T')[0],
    done,
    total,
  };
});

export const mockIntegrationSubjects = [
  { id: 'int-tarih', name: 'Tarih', emoji: '📜', color: '#F97316' },
  { id: 'int-cografya', name: 'Coğrafya', emoji: '🗺️', color: '#84CC16' },
  { id: 'int-felsefe', name: 'Felsefe', emoji: '🏛️', color: '#EC4899' },
];
