'use client';
import { useStore } from '@/store';

export function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      right: 16,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 320,
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: string; emoji?: string }; onDismiss: () => void }) {
  const borderColors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--purple)', warning: 'var(--amber)' };
  const border = borderColors[toast.type as keyof typeof borderColors] || 'var(--purple)';

  return (
    <div
      style={{
        background: 'var(--s2)',
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'slideInRight .2s ease-out',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {toast.emoji && <span style={{ fontSize: 16 }}>{toast.emoji}</span>}
      <span style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text)', flex: 1 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, padding: 0 }}
      >x</button>
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: 2,
        background: border,
        width: '100%',
        animation: 'toastProgress 3.5s linear forwards',
      }} />
    </div>
  );
}
