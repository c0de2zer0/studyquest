export function formatTime(seconds: number): string {
  if (seconds === Infinity || isNaN(seconds)) return '∞';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}dk`;
  if (m === 0) return `${h}sa`;
  return `${h}sa ${m}dk`;
}

export function formatHoursFromSeconds(seconds: number): string {
  return formatHours(seconds / 3600);
}

export function getRankFromHours(totalHours: number): { name: string; emoji: string; color: string } {
  const ranks = [
    { name: 'Kaşif',  emoji: '🌱', minHours: 0,   maxHours: 10,   color: '#64748B' },
    { name: 'Çırak',  emoji: '📖', minHours: 10,  maxHours: 50,   color: '#22D3EE' },
    { name: 'Öğrenci',emoji: '🎓', minHours: 50,  maxHours: 150,  color: '#A78BFA' },
    { name: 'Bilge',  emoji: '🦉', minHours: 150, maxHours: 400,  color: '#F59E0B' },
    { name: 'Üstat',  emoji: '⚔️', minHours: 400, maxHours: 800,  color: '#F97316' },
    { name: 'Efsane', emoji: '🌟', minHours: 800, maxHours: Infinity, color: '#FFD700' },
  ];
  return ranks.find(r => totalHours >= r.minHours && totalHours < r.maxHours) ?? ranks[ranks.length - 1];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return clamp((value / total) * 100, 0, 100);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

export function formatDate(date: Date): string {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateLong(date: Date): string {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${days[date.getDay()]}`;
}

export function getTurkishDay(date: Date): string {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[date.getDay()];
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
