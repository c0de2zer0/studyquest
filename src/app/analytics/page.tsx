'use client';

import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar, Flame, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatHours, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

// ─── Analytics Page ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { dailyHours, subjectDistribution, user, taskHistory } = useStore();
  const maxVal = Math.max(...dailyHours);
  const totalMonth = dailyHours.reduce((a, b) => a + b, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Analitik
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          \u00c7al\u0131\u015fma istatistiklerini g\u00f6r\u00fcnt\u00fcle
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Clock, label: 'Bu Ay', value: formatHours(totalMonth), color: '#00f0ff' },
          { icon: Flame, label: 'Seri', value: `${user.streak} gun`, color: '#ffd700' },
          { icon: TrendingUp, label: 'Toplam', value: formatHours(user.totalHours), color: '#10b981' },
          { icon: Calendar, label: 'Hedef', value: `${user.examDaysLeft} gun`, color: '#8b5cf6' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Daily Hours Bar Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              Son 30 Gun
            </h2>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saat</span>
          </div>
          <div className="flex items-end gap-[3px] h-40">
            {dailyHours.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(h / (maxVal || 1)) * 100}%` }}
                  transition={{ delay: i * 0.01, duration: 0.3 }}
                  className={cn(
                    'w-full rounded-sm',
                    h >= 5 ? 'bg-cyan-500' : h >= 3 ? 'bg-cyan-400/60' : 'bg-cyan-400/20'
                  )}
                  style={{ minHeight: 2 }}
                />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Subject Distribution + Task Completion */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
        {/* Subject Distribution */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <PieChart className="w-4 h-4 text-purple-500" />
            Ders Da\u011f\u0131l\u0131m\u0131
          </h2>
          <div className="space-y-3">
            {subjectDistribution.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>{s.subject}</span>
                  <span style={{ color: 'var(--text-muted)' }}>%{s.pct}</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Task Completion */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            G\u00f6rev Tamamlama
          </h2>
          <div className="space-y-2">
            {taskHistory.slice(-14).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs w-20" style={{ color: 'var(--text-muted)' }}>
                  {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                </span>
                <div
                  className="flex-1 h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.done / Math.max(day.total, 1)) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: 'rgba(16,185,129,0.5)' }}
                  />
                </div>
                <span className="text-xs w-12 text-right" style={{ color: 'var(--text-muted)' }}>
                  {day.done}/{day.total}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Ort. Gunluk', value: formatHours(totalMonth / 30), color: '#00f0ff' },
          { label: 'En Iyi Gun', value: formatHours(maxVal), color: '#ffd700' },
          { label: 'Toplam Seans', value: `${user.level * 12}`, color: '#8b5cf6' },
          { label: 'Toplam XP', value: user.xp.toLocaleString(), color: '#10b981' },
          { label: 'Rozetler', value: `${user.featuredBadges.length}`, color: '#ec4899' },
          { label: 'Koleksiyon', value: `${user.collectionCount}/${user.collectionTotal}`, color: '#f97316' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
