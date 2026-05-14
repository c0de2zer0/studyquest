'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  className,
  error,
}: SelectProps) {
  const selectId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full rounded-xl border px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] appearance-none',
            'bg-[var(--bg-surface)] border-[var(--border-color)]',
            'focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none',
            'transition-all duration-200',
            !value && 'text-[var(--text-tertiary)]',
            error && 'border-red-500/50 focus:border-red-400/50 focus:ring-red-400/20',
            className,
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-white">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
