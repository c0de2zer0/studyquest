import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'StudyQuest',
  description: 'Gamified study platform — level up your learning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
