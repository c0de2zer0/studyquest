'use client';
interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
}
export function SectionLabel({ children, color }: SectionLabelProps) {
  return (
    <div className="section-label" style={color ? { color } : undefined}>
      {children}
    </div>
  );
}
