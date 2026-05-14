'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
  danger:
    'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
