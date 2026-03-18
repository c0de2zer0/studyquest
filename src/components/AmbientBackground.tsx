'use client';
export function AmbientBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: `
        radial-gradient(ellipse 80% 35% at 20% 0%, rgba(123,92,245,.09), transparent 65%),
        radial-gradient(ellipse 60% 30% at 85% 100%, rgba(34,211,238,.07), transparent 65%)
      `,
    }} />
  );
}
