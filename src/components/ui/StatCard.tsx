'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  className?: string;
}

export default function StatCard({ icon: Icon, label, value, color, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-2xl border shadow-sm p-4 backdrop-blur-xl',
        'bg-[var(--bg-card)] border-[var(--border-color)]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">{label}</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
