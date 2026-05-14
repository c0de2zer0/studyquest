'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Shield, Bell, LogOut, ChevronRight, Coins, Zap, Award } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn, formatHours, getRankFromHours } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const [tab, setTab] = useState<'profile' | 'settings'>('profile');
  const { user, badges } = useStore();
  const rank = getRankFromHours(user.totalHours);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl max-w-xs"
        style={{ backgroundColor: 'var(--bg-hover)' }}
      >
        {[
          { id: 'profile' as const, label: 'Profil', icon: User },
          { id: 'settings' as const, label: 'Ayarlar', icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              tab === t.id
                ? 'text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            style={
              tab === t.id
                ? { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }
                : {}
            }
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <>
          {/* Profile Hero */}
          <Card className="text-center relative overflow-hidden">
            <div className="relative">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {user.emoji}
              </motion.div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="purple">{rank.emoji} {rank.name}</Badge>
                <Badge variant="info">Lv.{user.level}</Badge>
              </div>
              <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                {user.bio}
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.followers}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Takipçi</p>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: 'var(--border-color)' }} />
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.following}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Takip</p>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: 'var(--border-color)' }} />
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.streak}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gün Seri</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Zap, label: 'Toplam XP', value: user.xp.toLocaleString(), color: '#8b5cf6' },
              { icon: Coins, label: 'Bakiye', value: `${user.balance}`, color: '#ca8a04' },
              { icon: Award, label: 'Toplam Saat', value: formatHours(user.totalHours), color: '#0891b2' },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Badges */}
          <Card>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rozetler</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    'p-3 rounded-xl text-center border transition-all',
                    badge.unlocked
                      ? 'hover:shadow-sm'
                      : 'opacity-30'
                  )}
                  style={
                    badge.unlocked
                      ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }
                      : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }
                  }
                >
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <p className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Info */}
          <Card>
            <div className="space-y-3">
              {[
                { label: 'Katılma Tarihi', value: user.joinDate },
                { label: 'Koleksiyon', value: `${user.collectionCount}/${user.collectionTotal}` },
                { label: 'Sıralama', value: 'Altın IV · 45 LP' },
                { label: 'Doğrulama', value: user.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış' },
              ].map((info) => (
                <div
                  key={info.label}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{info.label}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{info.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Hesap</h2>
            <div className="space-y-1">
              {[
                { icon: User, label: 'Profil Bilgileri', desc: 'İsim, biyografi ve avatar' },
                { icon: Bell, label: 'Bildirimler', desc: 'Push ve e-posta tercihleri' },
                { icon: Shield, label: 'Gizlilik', desc: 'Profil ve aktivite görünürlüğü' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Entegrasyonlar</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Google Calendar', emoji: '📅', connected: true },
                { name: 'Notion', emoji: '📋', connected: false },
                { name: 'Obsidian', emoji: '🧠', connected: true },
                { name: 'Todoist', emoji: '✅', connected: false },
              ].map((int) => (
                <div
                  key={int.name}
                  className="flex items-center gap-3 p-3 rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="text-lg">{int.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{int.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: int.connected ? 'var(--color-emerald)' : 'var(--text-muted)' }}
                    >
                      {int.connected ? 'Bağlı' : 'Bağlan'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Uygulama</h2>
            <div className="space-y-3">
              {[
                { label: 'Ses Efektleri', value: 'Açık' },
                { label: 'Masaüstü Bildirimleri', value: 'Açık' },
                { label: 'Otomatik Zamanlayıcı', value: 'Kapalı' },
                { label: 'Karanlık Mod', value: 'Açık' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Button variant="danger" className="w-full" icon={LogOut}>Çıkış Yap</Button>
        </div>
      )}
    </motion.div>
  );
}
