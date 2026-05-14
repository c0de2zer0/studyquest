'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Timer, Calendar, User as UserIcon, ShoppingBag, Users,
  Swords, Shuffle, Trophy, BarChart3, Settings, Gamepad2,
  Moon, Sun,
} from 'lucide-react';
import { mockUser } from '@/lib/mock-data';
import type { User as UserType } from '@/lib/mock-data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type TabId =
  | 'dashboard' | 'timer' | 'plan' | 'avatar' | 'market'
  | 'community' | 'tournament' | 'rando' | 'leaderboard'
  | 'analytics' | 'profile' | 'games';

const navItems: { id: TabId; label: string; icon: typeof UserIcon; href: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'timer', label: 'Timer', icon: Timer, href: '/timer' },
  { id: 'plan', label: 'Plan', icon: Calendar, href: '/plan' },
  { id: 'avatar', label: 'Avatar', icon: UserIcon, href: '/avatar' },
  { id: 'market', label: 'Market', icon: ShoppingBag, href: '/market' },
  { id: 'community', label: 'Community', icon: Users, href: '/community' },
  { id: 'tournament', label: 'Tournament', icon: Swords, href: '/tournament' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  { id: 'rando', label: 'Rando', icon: Shuffle, href: '/rando' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'games', label: 'Games', icon: Gamepad2, href: '/games' },
  { id: 'profile', label: 'Profile', icon: Settings, href: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const activeTab = pathname === '/' ? 'dashboard' : (pathname.slice(1) as TabId);
  const [dark, setDark] = useState(false);

  // On mount, read localStorage preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 h-16 shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">SQ</span>
        </div>
        <span style={{ color: 'var(--text-primary)' }} className="font-semibold tracking-tight">
          StudyQuest
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
                )}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--active-bg)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: 'var(--active-bg)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User mini profile + Theme toggle */}
      <SidebarFooter user={mockUser} dark={dark} onToggleTheme={toggleTheme} />
    </aside>
  );
}

function SidebarFooter({
  user,
  dark,
  onToggleTheme,
}: {
  user: UserType;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div
      className="px-4 py-4 shrink-0 space-y-3"
      style={{ borderTop: '1px solid var(--sidebar-border)' }}
    >
      {/* User profile */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-lg">
          {user.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium truncate">
            {user.name}
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs truncate">
            {user.rank} &middot; Lv.{user.level}
          </p>
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors"
        style={{
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--badge-bg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--badge-bg)';
        }}
      >
        {dark ? (
          <>
            <Sun className="w-4 h-4" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    </div>
  );
}
