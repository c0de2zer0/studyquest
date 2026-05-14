'use client';

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className="h-4 w-4 text-[var(--text-tertiary)]" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border px-4 py-2.5 text-sm text-[var(--text-primary)]',
              'bg-[var(--bg-surface)] border-[var(--border-color)]',
              'placeholder:text-[var(--text-tertiary)]',
              'focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none',
              'transition-all duration-200',
              Icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-400/50 focus:ring-red-400/20',
              className,
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
