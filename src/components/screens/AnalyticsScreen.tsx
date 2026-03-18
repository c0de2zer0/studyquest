'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { mockDailyHours, mockHeatmapData, mockSubjectDistribution } from '@/lib/mock-data';
import { useState } from 'react';

const PERIODS = ['Bu Hafta', 'Bu Ay', 'Bu Yıl'] as const;
type Period = typeof PERIODS[number];

const PERIOD_DATA: Record<Period, { today: string; week: string; month: string; total: string; trendToday: string; trendWeek: string; trendMonth: string; trendColor: string }> = {
  'Bu Hafta': { today: '3sa 20dk', week: '18sa 40dk', month: '72 saat', total: '247 saat', trendToday: '+15%', trendWeek: '-8%', trendMonth: '+23%', trendColor: '#10B981' },
  'Bu Ay': { today: '3sa 20dk', week: '72sa 0dk', month: '247 saat', total: '247 saat', trendToday: '+15%', trendWeek: '+12%', trendMonth: '+23%', trendColor: '#10B981' },
  'Bu Yıl': { today: '3sa 20dk', week: '18sa 40dk', month: '247 saat', total: '247 saat', trendToday: '+15%', trendWeek: '+8%', trendMonth: '+18%', trendColor: '#10B981' },
};

const HM_COLORS = ['rgba(255,255,255,.05)', 'rgba(123,92,245,.25)', 'rgba(123,92,245,.45)', 'rgba(123,92,245,.65)', '#7B5CF5'];

export function AnalyticsScreen() {
  const { user } = useStore();
  const [period, setPeriod] = useState<Period>('Bu Hafta');
  const [compMode, setCompMode] = useState<'week' | 'league'>('week');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [clickedSegment, setClickedSegment] = useState<number | null>(null);

  const periodData = PERIOD_DATA[period];
  const maxHours = Math.max(...mockDailyHours);
  const targetLine = 6; // hours

  // Donut chart calculations
  const CIRC_R = 30;
  const DONUT_CIRC = 2 * Math.PI * CIRC_R;
  let accOffset = 0;
  const donutSegments = mockSubjectDistribution.map((subj) => {
    const dashLen = (subj.pct / 100) * DONUT_CIRC;
    const offset = accOffset;
    accOffset += dashLen;
    return { ...subj, dashLen, offset };
  });

  const projectedHours = Math.round(user.totalHours + (user.todayHours * 89));
  const goalHours = 600;
  const remaining = Math.max(0, goalHours - user.totalHours);
  const neededPerDay = remaining > 0 ? (remaining / user.examDaysLeft).toFixed(1) : '0';
  const isOnTrack = projectedHours >= goalHours;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, fontFamily: 'Space Mono', fontSize: 9, padding: '7px 0', borderRadius: 6, cursor: 'pointer',
              background: period === p ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${period === p ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
              color: period === p ? '#9D82F8' : 'var(--dim)',
            }}
          >{p}</button>
        ))}
      </div>

      {/* Summary 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'BUGÜN', value: periodData.today, trend: periodData.trendToday, color: '#22D3EE', borderColor: '#22D3EE' },
          { label: 'BU HAFTA', value: periodData.week, trend: periodData.trendWeek, color: '#F59E0B', borderColor: '#F59E0B' },
          { label: 'BU AY', value: periodData.month, trend: periodData.trendMonth, color: '#10B981', borderColor: '#10B981' },
          { label: 'TOPLAM', value: periodData.total, trend: 'Hedef: 600 sa', color: '#7B5CF5', borderColor: '#7B5CF5', trendIsNeutral: true },
        ].map(card => (
          <div key={card.label} className="card" style={{ borderTop: `2px solid ${card.borderColor}`, padding: 12 }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: card.trendIsNeutral ? 'var(--muted)' : card.trend.startsWith('+') ? '#10B981' : '#EF4444' }}>{card.trend}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>SON 30 GÜNLÜK ÇALIŞMA</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#F59E0B' }}>
            Ort: {(mockDailyHours.reduce((a, b) => a + b, 0) / mockDailyHours.length).toFixed(1)} sa/gün
          </span>
        </div>
        <div style={{ position: 'relative', height: 100 }}>
          {/* Target line */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: `${100 - (targetLine / maxHours) * 100}%`,
            height: 1, background: 'rgba(239,68,68,.5)',
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: '#EF4444', background: 'var(--s1)', paddingRight: 2, position: 'absolute', left: 0 }}>6sa</span>
          </div>
          {/* Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 2 }}>
            {mockDailyHours.map((hours, i) => {
              const isToday = i === mockDailyHours.length - 1;
              const isRecent = i >= mockDailyHours.length - 5;
              const barH = `${Math.max(4, (hours / maxHours) * 100)}%`;
              return (
                <div
                  key={i}
                  style={{ flex: 1, position: 'relative' }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div style={{
                    height: barH,
                    background: isToday
                      ? 'linear-gradient(180deg, #22D3EE, #7B5CF5)'
                      : isRecent ? 'rgba(123,92,245,.5)' : 'rgba(123,92,245,.25)',
                    borderRadius: '3px 3px 0 0',
                    boxShadow: isToday ? '0 0 8px rgba(34,211,238,.3)' : 'none',
                    transition: 'opacity .15s',
                    opacity: hoveredBar !== null && hoveredBar !== i ? .7 : 1,
                  }} />
                  {hoveredBar === i && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--s3)', border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 4, padding: '3px 6px', whiteSpace: 'nowrap',
                      fontFamily: 'Space Mono', fontSize: 8, color: 'var(--text)', zIndex: 10,
                    }}>
                      {hours.toFixed(1)} sa
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>30g önce</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>Bugün</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>ÇALIŞMA ISI HARİTASI</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Toplam: 142 aktif gün</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 12 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ height: 10, fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)', lineHeight: '10px' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ flex: 1, overflowX: 'auto' }} className="no-scrollbar">
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 26 }, (_, colIdx) => (
                <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Array.from({ length: 7 }, (_, rowIdx) => {
                    const dataIdx = colIdx * 7 + rowIdx;
                    const rawVal = mockHeatmapData[dataIdx] || 0;
                    const hmIdx = rawVal === 0 ? 0 : rawVal <= 2 ? 1 : rawVal <= 4 ? 2 : rawVal <= 6 ? 3 : 4;
                    return (
                      <div
                        key={rowIdx}
                        style={{
                          width: 10, height: 10,
                          borderRadius: 2,
                          background: HM_COLORS[hmIdx],
                          boxShadow: hmIdx === 4 ? '0 0 4px rgba(123,92,245,.4)' : 'none',
                          cursor: 'pointer',
                        }}
                        data-tooltip={`${rawVal}sa`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Month labels */}
            <div style={{ display: 'flex', marginTop: 4, gap: 0 }}>
              {['Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'].map((m) => (
                <div key={m} style={{ flex: 1, fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)', textAlign: 'center' }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>Az</span>
          {HM_COLORS.map((color, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
          ))}
          <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>Çok</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>En uzun seri: 31 gün</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#F59E0B' }}>Mevcut seri: {user.streak} gün 🔥</span>
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="card">
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>DERS DAĞILIMI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Donut */}
          <svg width={80} height={80} style={{ flexShrink: 0 }}>
            {donutSegments.map((seg, i) => (
              <circle
                key={i}
                cx={40} cy={40} r={CIRC_R}
                fill="none"
                stroke={seg.color}
                strokeWidth={clickedSegment === i ? 10 : 8}
                strokeDasharray={`${seg.dashLen} ${DONUT_CIRC}`}
                strokeDashoffset={-seg.offset}
                style={{ cursor: 'pointer', transition: 'stroke-width .2s', transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
                onClick={() => setClickedSegment(clickedSegment === i ? null : i)}
              />
            ))}
          </svg>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {mockSubjectDistribution.map((subj, i) => (
              <div key={subj.subject} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: clickedSegment !== null && clickedSegment !== i ? .5 : 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: subj.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)', flex: 1 }}>{subj.subject}</span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{subj.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Tracking */}
      <div className="card">
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>HEDEF TAKİBİ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Matematik: Hedef 3sa/gün', actual: 2.1, target: 3, color: '#F59E0B' },
            { label: 'Genel: Hedef 6sa/gün', actual: user.todayHours, target: 6, color: '#7B5CF5' },
          ].map(row => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: row.color }}>→ {row.actual}sa</span>
              </div>
              <ProgressBar value={(row.actual / row.target) * 100} variant={row.color === '#7B5CF5' ? 'purple' : 'amber'} height={5} />
            </div>
          ))}
        </div>
        {/* Projection box */}
        <div style={{
          background: isOnTrack ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.06)',
          border: `1px solid ${isOnTrack ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
          borderRadius: 8, padding: 12,
        }}>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#7B5CF5', letterSpacing: 1, marginBottom: 6 }}>📊 SINAV PROJEKSİYONU</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>Bu hızla gidersen sınava kadar:</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 24, color: isOnTrack ? '#10B981' : '#F59E0B', marginBottom: 4 }}>{projectedHours} saat</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 6 }}>
            Hedef: {goalHours} saat · Kalan: {remaining} saat
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: isOnTrack ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
            Günde {neededPerDay} saat çalışmalısın
          </div>
        </div>
      </div>

      {/* Task Analysis */}
      <div className="card">
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>GÖREV ANALİZİ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 10 }}>
          {[
            { label: 'Toplam Görev', value: '342', color: 'var(--text)' },
            { label: 'Tamamlanan', value: '267 (78%)', color: '#10B981' },
            { label: 'Ort. Süre', value: '1sa 20dk', color: '#22D3EE' },
            { label: 'En Verimli', value: '10:00–12:00', color: '#7B5CF5' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '7px 10px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 6 }}>
          <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#F59E0B' }}>En çok geciktirilen ders: Kimya ⚗️</span>
        </div>
      </div>

      {/* Comparison */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>KARŞILAŞTIRMA</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['week', 'league'] as const).map(m => (
              <button key={m} onClick={() => setCompMode(m)} style={{ fontFamily: 'Space Mono', fontSize: 8, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', background: compMode === m ? 'rgba(123,92,245,.15)' : 'none', border: `1px solid ${compMode === m ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.06)'}`, color: compMode === m ? '#9D82F8' : 'var(--dim)' }}>
                {m === 'week' ? 'Geçen Hafta' : 'Lig Ortalaması'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#22D3EE', marginBottom: 4 }}>Sen</div>
            <div style={{ height: 60, background: 'rgba(34,211,238,.15)', border: '1px solid rgba(34,211,238,.3)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#22D3EE' }}>{user.weeklyXp.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 4 }}>{compMode === 'week' ? 'Geçen Hafta' : 'Lig Ort.'}</div>
            <div style={{ height: compMode === 'week' ? 50 : 44, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 4 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 13, color: 'var(--muted)' }}>{compMode === 'week' ? user.weeklyXpPrev.toLocaleString() : '4,800'}</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#10B981', marginTop: 8 }}>
          Bu hafta ligin %{Math.round((1 - (5 / 8)) * 100 + 37)} üzerindesin 📈
        </div>
      </div>
    </div>
  );
}
