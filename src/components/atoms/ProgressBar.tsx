'use client';
interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'purple'|'cyan'|'amber'|'green';
  height?: number;
  className?: string;
  showGlow?: boolean;
}
export function ProgressBar({ value, variant = 'purple', height = 5, className = '', showGlow }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillClass = variant === 'purple' ? 'progress-fill' : `progress-fill progress-fill-${variant}`;
  return (
    <div className={`progress-track ${className}`} style={{ height }}>
      <div
        className={fillClass}
        style={{
          width: `${clampedValue}%`,
          height: '100%',
          boxShadow: showGlow ? `0 0 8px var(--${variant})` : undefined
        }}
      />
    </div>
  );
}
