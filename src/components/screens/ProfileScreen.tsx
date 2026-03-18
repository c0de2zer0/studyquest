'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { mockBadges, mockHeatmapData } from '@/lib/mock-data';
import { RANK_TIER_COLORS } from '@/lib/constants';
import { RankBadge } from '@/components/RankBadge';
import { useState } from 'react';

const HM_COLORS = ['rgba(255,255,255,.05)', 'rgba(123,92,245,.25)', 'rgba(123,92,245,.45)', 'rgba(123,92,245,.65)', '#7B5CF5'];

const SETTINGS_ROWS = [
  { emoji: '👤', name: 'Profil Düzenle', sub: 'Ad, bio, fotoğraf', key: 'edit' },
  { emoji: '🔔', name: 'Bildirimler', sub: 'Streak, turnuva, arkadaş', key: 'notif' },
  { emoji: '🔒', name: 'Gizlilik', sub: 'Profil görünürlüğü', key: 'privacy' },
  { emoji: '🔗', name: 'Entegrasyonlar', sub: 'Google, Notion, Obsidian', key: 'integrations' },
  { emoji: '📱', name: 'Uygulama', sub: 'iOS & Android', key: 'app' },
];

export function ProfileScreen() {
  const { user, profileTab, setProfileTab, setActiveTab, showToast } = useStore();
  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [notifications, setNotifications] = useState({ streak: true, tournament: true, friends: false });
  const [privacy, setPrivacy] = useState('Herkes');

  const unlockedBadges = mockBadges.filter(b => b.unlocked);
  const featuredBadges = unlockedBadges.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        {(['profile', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setProfileTab(tab)}
            style={{
              flex: 1, padding: '8px 0', fontFamily: 'Orbitron', fontSize: 9, letterSpacing: 1,
              textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer',
              color: profileTab === tab ? '#22D3EE' : 'var(--dim)',
              borderBottom: profileTab === tab ? '2px solid #22D3EE' : '2px solid transparent',
            }}
          >{tab === 'profile' ? 'Profil' : 'Ayarlar'}</button>
        ))}
      </div>

      {profileTab === 'profile' && (
        <>
          {/* Profile Hero */}
          <div className="card" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(123,92,245,.1), transparent)',
            textAlign: 'center', padding: 20,
          }}>
            <div style={{ fontSize: 72, animation: 'float 3s ease-in-out infinite', display: 'inline-block', marginBottom: 10 }}>{user.emoji}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, letterSpacing: 2, color: 'var(--text)', marginBottom: 4 }}>{user.name.toUpperCase()}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>{user.bio}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <RankBadge tier={user.rankTier} division={user.rankDivision} lp={user.lp} size="lg" />
              <Badge variant="amber">🔥 {user.streak} GÜN SERİ</Badge>
              <Badge variant="cyan">LV.{user.level}</Badge>
            </div>
            {user.lpHistory.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, height: 24, marginBottom: 8 }}>
                {user.lpHistory.map((gain, i) => {
                  const maxGain = Math.max(...user.lpHistory, 1);
                  const barH = Math.max(3, Math.round((gain / maxGain) * 20));
                  return (
                    <div key={i} style={{
                      width: 6, height: barH, borderRadius: 2,
                      background: RANK_TIER_COLORS[user.rankTier] || 'var(--purple)',
                      opacity: 0.6 + 0.4 * (i / Math.max(1, user.lpHistory.length - 1)),
                    }} />
                  );
                })}
              </div>
            )}
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>📅 {user.joinDate}'ten beri</div>

            {/* Stats row */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 14, paddingTop: 14 }}>
              {[
                { value: user.totalHours, label: 'TOPLAM SA' },
                { value: user.streak, label: 'SERİ' },
                { value: 3, label: 'TURNUVA' },
                { value: `${Math.round(user.collectionCount / user.collectionTotal * 100)}%`, label: 'KOLEKSİYON' },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  flex: 1, textAlign: 'center', padding: '0 6px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,.06)' : 'none',
                }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Follow row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{user.followers} Takipçi</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{user.following} Takip</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{user.friends} Arkadaş</button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn-gradient"
                style={{ flex: 1, padding: '9px 0', fontSize: 8 }}
                onClick={() => showToast('Arkadaş isteği gönderildi! ✓', 'success', '➕')}
              >+ ARKADAŞ EKLE</button>
              <button
                style={{ flex: 1, padding: '9px 0', background: 'none', border: '1px solid rgba(123,92,245,.3)', borderRadius: 8, color: '#7B5CF5', fontFamily: 'Orbitron', fontSize: 8, cursor: 'pointer' }}
                onClick={() => { navigator.clipboard.writeText('studyquest.app/rando/sf-x8k2'); showToast('Rando linki kopyalandı!', 'success', '🤝'); setActiveTab('rando'); }}
              >🤝 RANDO DAVET</button>
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <SectionLabel>BAŞARI ROZETLERİ</SectionLabel>
            {/* Featured row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {featuredBadges.map(badge => (
                <div key={badge.id} className="card" style={{ flex: 1, textAlign: 'center', padding: 12, border: '1px solid rgba(123,92,245,.2)' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{badge.emoji}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: '#A78BFA' }}>{badge.name}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {mockBadges.map(badge => (
                <div
                  key={badge.id}
                  className="card"
                  style={{ padding: 8, textAlign: 'center', opacity: badge.unlocked ? 1 : .35, filter: badge.unlocked ? 'none' : 'grayscale(1)' }}
                  data-tooltip={badge.unlocked ? badge.description : badge.condition}
                >
                  <div style={{ fontSize: badge.unlocked ? 20 : 16 }}>{badge.emoji}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 6, color: 'var(--muted)', marginTop: 2 }}>
                    {badge.unlocked ? badge.name : '🔒'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Summary */}
          <div>
            <SectionLabel>ÖZET STATLAR</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'En Uzun Seri', value: '31 gün', color: '#EF4444' },
                { label: 'Favori Ders', value: 'Matematik 📐', color: '#7B5CF5' },
                { label: 'Toplam Görev', value: '342 tamamlandı', color: '#10B981' },
                { label: 'En İyi Rank', value: '#2 Haftalık', color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: 12 }}>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Heatmap */}
          <div>
            <SectionLabel>AKTİVİTE</SectionLabel>
            <div className="card">
              <div style={{ display: 'flex', gap: 1, overflowX: 'auto' }} className="no-scrollbar">
                {Array.from({ length: 26 }, (_, colIdx) => (
                  <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Array.from({ length: 7 }, (_, rowIdx) => {
                      const dataIdx = colIdx * 7 + rowIdx;
                      const rawVal = mockHeatmapData[dataIdx] || 0;
                      const hmIdx = rawVal === 0 ? 0 : rawVal <= 2 ? 1 : rawVal <= 4 ? 2 : rawVal <= 6 ? 3 : 4;
                      return <div key={rowIdx} style={{ width: 8, height: 8, borderRadius: 2, background: HM_COLORS[hmIdx] }} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {profileTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SETTINGS_ROWS.map(row => (
            <div key={row.key}>
              <div
                className="card"
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderLeft: expandedSetting === row.key ? '2px solid #7B5CF5' : '2px solid transparent' }}
                onClick={() => setExpandedSetting(expandedSetting === row.key ? null : row.key)}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(123,92,245,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{row.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{row.name}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{row.sub}</div>
                </div>
                <span style={{ color: 'var(--dim)', transform: expandedSetting === row.key ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>›</span>
              </div>
              {expandedSetting === row.key && (
                <div className="card" style={{ background: 'var(--s2)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, marginTop: -6 }}>
                  {row.key === 'edit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 4 }}>Kullanıcı Adı</div>
                        <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', background: 'var(--s1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 12 }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 4 }}>Bio</div>
                        <textarea rows={2} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ width: '100%', background: 'var(--s1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 12, resize: 'none' }} />
                      </div>
                      <button className="btn-gradient" style={{ padding: '8px 20px', alignSelf: 'flex-start', fontSize: 9 }} onClick={() => showToast('Profil güncellendi!', 'success', '✅')}>KAYDET</button>
                    </div>
                  )}
                  {row.key === 'notif' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { key: 'streak', label: 'Streak hatırlatma' },
                        { key: 'tournament', label: 'Turnuva bildirimi' },
                        { key: 'friends', label: 'Arkadaş aktivitesi' },
                      ].map(n => (
                        <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text)' }}>{n.label}</span>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                            style={{
                              width: 40, height: 22, borderRadius: 11, cursor: 'pointer', border: 'none', transition: 'background .2s',
                              background: notifications[n.key as keyof typeof notifications] ? '#7B5CF5' : 'rgba(255,255,255,.1)',
                              position: 'relative',
                            }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: 'white',
                              position: 'absolute', top: 3, transition: 'left .2s',
                              left: notifications[n.key as keyof typeof notifications] ? 21 : 3,
                            }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {row.key === 'privacy' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {['Herkes', 'Sadece arkadaşlar', 'Sadece ben'].map(opt => (
                        <button key={opt} onClick={() => setPrivacy(opt)} style={{ padding: '8px 12px', background: privacy === opt ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${privacy === opt ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.06)'}`, borderRadius: 6, color: privacy === opt ? '#9D82F8' : 'var(--muted)', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>{opt}</button>
                      ))}
                    </div>
                  )}
                  {row.key === 'app' && (
                    <div style={{ textAlign: 'center', padding: 10 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['App Store', 'Google Play'].map(store => (
                          <button key={store} style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 11, cursor: 'pointer' }}>{store}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {row.key === 'integrations' && (
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--muted)' }}>
                      Entegrasyon ayarları PLAN sekmesinde bulunmaktadır.
                      <button onClick={() => setActiveTab('plan')} style={{ background: 'none', border: 'none', color: '#7B5CF5', cursor: 'pointer', fontFamily: 'Rajdhani', fontSize: 12, marginLeft: 4 }}>Plan'a git →</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Logout */}
          <div
            className="card"
            style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => showToast('Çıkış yapıldı! Görüşürüz 👋', 'info', '🚪')}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.08)'; (e.currentTarget as HTMLElement).style.borderLeft = '2px solid rgba(239,68,68,.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--s1)'; (e.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255,255,255,.06)'; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚪</div>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Çıkış Yap</span>
          </div>
        </div>
      )}
    </div>
  );
}
