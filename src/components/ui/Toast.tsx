'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const borderStyles: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-cyan-500',
  warning: 'border-l-yellow-500',
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-cyan-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg border-l-4 backdrop-blur-xl',
              'bg-[var(--bg-surface)] border-[var(--border-color)]',
              borderStyles[toast.type],
            )}
          >
            <div className="flex-shrink-0 mt-0.5 pl-4 pt-4">
              {iconMap[toast.type]}
            </div>

            <p className="flex-1 text-sm text-[var(--text-primary)] py-4">
              {toast.message}
            </p>

            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors mr-4 mt-4"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
