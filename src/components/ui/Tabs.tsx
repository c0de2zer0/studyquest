'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const activeElement = containerRef.current.querySelector(
      `[data-tab-id="${activeTab}"]`,
    ) as HTMLElement | null;

    if (activeElement) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex overflow-x-auto gap-1 p-1 rounded-xl bg-[var(--bg-hover)]',
        'scrollbar-none',
        className,
      )}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute bottom-1 top-1 rounded-lg bg-[var(--bg-surface)] shadow-sm"
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'transition-colors duration-200 whitespace-nowrap',
              isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
