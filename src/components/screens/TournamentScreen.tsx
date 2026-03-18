'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { useCountdown } from '@/hooks/useCountdown';
import { mockLeaderboard } from '@/lib/mock-data';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  active: '#7B5CF5', tomorrow: '#22D3EE', open: '#F59E0B', soon: '#10B981', upcoming: '#64748B',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'AKTİF', tomorrow: 'YARIN', open: 'AÇIK', soon: '3G SONRA', upcoming: '12G SONRA',
};

const PAST_TOURNAMENTS = [
  { id: 'p1', name: 'Sprint #48', result: '1. Sıra', emoji: '🥇', reward: 'Siber Maske + +5 sa', resultColor: '#FFD700' },
  { id: 'p2', name: 'Maraton #21', result: '3. Sıra', emoji: '🥉', reward: '+2 sa', resultColor: '#CD7F32' },
  { id: 'p3', name: 'Ders Düellosu', result: '5. Sıra', emoji: '🏅', reward: 'Katılım rozeti', resultColor: '#64748B' },
];

export function TournamentScreen() {
  const { tournaments, joinTournament, expandedTournaments, toggleExpandTournament } = useStore();
  const countdown = useCountdown(3 * 86400 + 14 * 3600);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const activeTournament = tournaments.find(t => t.status === 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Active Tournament Banner */}
      {activeTournament && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(123,92,245,.2), rgba(34,211,238,.15))',
          border: '1px solid rgba(123,92,245,.3)',
          borderRadius: 10, padding: 16, position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative emoji */}
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 64, opacity: .15, pointerEvents: 'none' }}>⚔️</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#7B5CF5', letterSpacing: 2, marginBottom: 6 }}>AKTİF TURNUVA</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>HAFTALIK MARATON</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            <span className="badge badge-purple">👥 {activeTournament.participants.toLocaleString()} katılımcı</span>
            <span className="badge badge-cyan">⏰ {countdown.formatted} kaldı</span>
            <span className="badge badge-cyan">SEN: #{activeTournament.myRank}</span>
          </div>
          {/* Progress bar */}
          <ProgressBar value={65} variant="purple" height={4} className="mb-3" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-gradient"
              style={{
                padding: '9px 18px', fontSize: 10,
                background: activeTournament.joined ? 'linear-gradient(135deg, #059669, #10B981)' : undefined,
              }}
              onClick={() => joinTournament(activeTournament.id)}
            >
              {activeTournament.joined ? '✓ KATILDIN' : '⚔️ KATIL'}
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              style={{
                padding: '9px 18px', background: 'none', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 8, color: 'var(--text)', fontFamily: 'Orbitron', fontSize: 9,
                cursor: 'pointer',
              }}
            >📊 LİDERBOARD</button>
          </div>
        </div>
      )}

      {/* Live Leaderboard (collapsible) */}
      {showLeaderboard && (
        <div className="card">
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#7B5CF5', marginBottom: 10, letterSpacing: 1 }}>CANLI LİDERBOARD</div>
          {mockLeaderboard.map(entry => {
            const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
            return (
              <div key={entry.rank} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,.04)',
                background: entry.isMe ? 'rgba(123,92,245,.07)' : 'transparent',
                borderRadius: entry.isMe ? 6 : 0,
                paddingLeft: entry.isMe ? 6 : 0,
              }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: medalColors[entry.rank - 1] || 'var(--dim)', width: 20, textAlign: 'center' }}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
                </span>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{entry.emoji}</div>
                <span style={{ flex: 1, fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: entry.isMe ? '#22D3EE' : 'var(--text)' }}>{entry.name}</span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#22D3EE' }}>{entry.totalHours}sa</span>
              </div>
            );
          })}
        </div>
      )}

      {/* All Tournaments */}
      <div>
        <SectionLabel>TÜM TURNUVALAR</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tournaments.map(tournament => {
            const statusColor = STATUS_COLORS[tournament.status];
            const isExpanded = expandedTournaments.includes(tournament.id);
            const isActive = tournament.status === 'active' || tournament.status === 'open';

            return (
              <div key={tournament.id} className="card" style={{ border: `1px solid ${statusColor}22` }}>
                {/* Top shine in tournament color */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`, opacity: 0.5 }} />

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => toggleExpandTournament(tournament.id)}
                >
                  <span style={{ fontSize: 32 }}>{tournament.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{tournament.name}</div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{tournament.rule}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-muted">👥 {tournament.participants.toLocaleString()}</span>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#F59E0B' }}>🏆 {tournament.prize}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'Space Mono', fontSize: 8, color: statusColor,
                      background: `${statusColor}14`, border: `1px solid ${statusColor}35`,
                      borderRadius: 4, padding: '2px 8px', marginBottom: 6,
                    }}>{STATUS_LABELS[tournament.status]}</div>
                    <span style={{ fontSize: 12, color: 'var(--dim)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <p style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
                      {tournament.name} turnuvasında {tournament.rule.toLowerCase()}. En iyi performansı göster ve ödülünü kazan!
                    </p>
                    {/* Prizes */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 6, letterSpacing: 1 }}>ÖDÜLLER</div>
                      {[
                        { rank: '1.', prize: tournament.prize, color: '#FFD700' },
                        { rank: '2.', prize: 'Gümüş Şampiyona', color: '#C0C0C0' },
                        { rank: '3.', prize: '+2 sa Bonus', color: '#CD7F32' },
                        { rank: 'Katılım', prize: 'Katılım Rozeti', color: '#64748B' },
                      ].map(row => (
                        <div key={row.rank} style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                          <span style={{ fontFamily: 'Orbitron', fontSize: 10, color: row.color, width: 50, flexShrink: 0 }}>{row.rank}</span>
                          <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)' }}>{row.prize}</span>
                        </div>
                      ))}
                    </div>
                    {tournament.id === 'tr4' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-gradient" style={{ flex: 1, padding: '9px 0', fontSize: 9 }} onClick={() => joinTournament(tournament.id)}>
                          {tournament.joined ? '✓ KATILDIN' : '👥 TAKIM KUR'}
                        </button>
                        <button style={{ flex: 1, padding: '9px 0', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'var(--muted)', fontFamily: 'Orbitron', fontSize: 8, cursor: 'pointer' }}>
                          TAKIMA KATIL
                        </button>
                      </div>
                    ) : (
                      <button
                        className={isActive ? 'btn-gradient' : ''}
                        style={{
                          width: '100%', padding: '10px 0', fontSize: 10,
                          ...(isActive ? {} : {
                            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                            borderRadius: 8, color: 'var(--dim)', fontFamily: 'Orbitron', fontSize: 9,
                            cursor: 'not-allowed',
                          }),
                        }}
                        disabled={!isActive}
                        onClick={() => isActive && joinTournament(tournament.id)}
                      >
                        {tournament.joined ? '✓ KATILDIN' : isActive ? '⚔️ KATIL' : STATUS_LABELS[tournament.status]}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Tournaments */}
      <div>
        <SectionLabel>GEÇMİŞ TURNUVALAR</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PAST_TOURNAMENTS.map(pt => (
            <div key={pt.id} className="card" style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{pt.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{pt.name}</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: pt.resultColor }}>{pt.result}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#F59E0B' }}>{pt.reward}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
