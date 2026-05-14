'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import ToastContainer from '@/components/ui/Toast';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      className="min-h-screen noise"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <Sidebar />
      <ToastContainer />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
