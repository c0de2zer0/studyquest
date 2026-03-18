'use client';
interface BadgeProps {
  variant?: 'purple'|'cyan'|'amber'|'green'|'red'|'gold'|'muted';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}
export function Badge({ variant = 'purple', children, className = '', pulse }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${pulse ? 'animate-pulse-glow' : ''} ${className}`}>
      {children}
    </span>
  );
}
