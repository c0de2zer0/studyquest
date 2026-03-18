import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyQuest",
  description: "Gamified study tracker for Turkish university exam students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
