'use client';
import { ProgressBar } from './ProgressBar';
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'purple'|'cyan'|'amber'|'green';
  progress?: number;
  onClick?: () => void;
}
export function StatCard({ label, value, sub, variant = 'purple', progress, onClick }: StatCardProps) {
  const colorMap = { purple: 'var(--purple)', cyan: 'var(--cyan)', amber: 'var(--amber)', green: 'var(--green)' };
  const color = colorMap[variant];
  return (
    <div
      className="card flex flex-col gap-1 cursor-pointer"
      style={{ borderTop: `2px solid ${color}` }}
      onClick={onClick}
    >
      <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color }}>{value}</span>
      {sub && <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{sub}</span>}
      {progress !== undefined && <ProgressBar value={progress} variant={variant} height={4} className="mt-1" />}
    </div>
  );
}
