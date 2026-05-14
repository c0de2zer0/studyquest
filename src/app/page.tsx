'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Flame, Clock, Target, TrendingUp, BookOpen, Zap, Trophy, Users,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { getRankFromHours, formatHours, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const tasks = useStore((s) => s.tasks);
  const friends = useStore((s) => s.friends);
  const rank = getRankFromHours(user.totalHours);

  const weeklyData = [40, 65, 45, 80, 55, 70, 90];
  const maxVal = Math.max(...weeklyData);
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome + Rank Badge */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Merhaba, {user.emoji} {user.name}
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Bugün öğrenmeye hazır mısın?
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="text-3xl">{rank.emoji}</div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.rank}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {rank.name} &middot; {user.totalHours} saat
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Flame} label="Seri" value={`${user.streak} gün`} color="#ffd700" />
        <StatCard icon={Clock} label="Bugün" value={formatHours(user.todayHours)} color="#00f0ff" />
        <StatCard icon={Target} label="Hedef" value={`${user.examDaysLeft} gün`} color="#8b5cf6" />
        <StatCard icon={TrendingUp} label="XP" value={user.xp.toLocaleString()} color="#10b981" />
      </motion.div>

      {/* Main Grid: responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Tasks + Weekly Chart */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Today's Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Bugünkü Görevler
              </h2>
              <Badge variant="info">{tasks.filter(t => t.status !== 'done').length} aktif</Badge>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-colors',
                    task.status === 'done'
                      ? 'opacity-50'
                      : 'hover:bg-[var(--hover-bg)]',
                  )}
                  style={{
                    backgroundColor: task.status === 'done'
                      ? 'var(--bg-hover)'
                      : 'var(--bg-hover)',
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.subjectColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        task.status === 'done' && 'line-through',
                      )}
                      style={{
                        color: task.status === 'done'
                          ? 'var(--text-muted)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {task.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {task.subjectEmoji} {task.subject} &middot; {task.startTime}-{task.endTime}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      task.status === 'done' && 'text-emerald-500 bg-emerald-50',
                      task.status === 'active' && 'text-cyan-500 bg-cyan-50',
                      task.status === 'pending' && 'bg-[var(--bg-hover)]',
                    )}
                    style={{
                      color: task.status === 'pending' ? 'var(--text-muted)' : undefined,
                    }}
                  >
                    {task.status === 'done' ? '\u2713' : '\u25CB'}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Weekly Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Trophy className="w-4 h-4" style={{ color: '#ffd700' }} />
                Haftal\u0131k \u00c7al\u0131\u015fma
              </h2>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user.weeklyXp.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-end justify-between h-32 gap-2 pt-2">
              {weeklyData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxVal) * 100}%` }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                    className="w-full rounded-lg bg-gradient-to-t from-cyan-400/30 to-cyan-300/15"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {days[i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* XP Progress */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Seviye \u0130lerlemesi
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Lv.{user.level}
              </span>
            </div>
            <ProgressBar value={user.xp} max={user.xpMax} color="purple" size="md" showLabel />
          </Card>
        </div>

        {/* Right: Friends + Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              H\u0131zl\u0131 \u0130\u015flemler
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: '\u00c7al\u0131\u015fmaya Ba\u015fla', color: '#00f0ff', href: '/timer' },
                { icon: BookOpen, label: 'Planla', color: '#8b5cf6', href: '/plan' },
                { icon: Users, label: 'Topluluk', color: '#10b981', href: '/community' },
                { icon: Trophy, label: 'S\u0131ralama', color: '#ffd700', href: '/leaderboard' },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      {action.label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Online Friends */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Arkada\u015flar
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {friends.filter(f => f.online).length} \u00e7evrimi\u00e7i
              </span>
            </div>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <div className="relative">
                    <span className="text-lg">{friend.emoji}</span>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2',
                        friend.online ? 'bg-emerald-400' : '',
                      )}
                      style={{
                        borderColor: friend.online ? undefined : 'var(--text-muted)',
                        backgroundColor: friend.online ? undefined : 'var(--text-muted)',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {friend.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {friend.statusText}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Lv.{friend.level}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
