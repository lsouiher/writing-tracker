import type { Metadata } from 'next';
import { TabNav } from '@/components/tab-nav';
import './globals.css';

export const metadata: Metadata = {
  title: "The Writer's Ledger",
  description: 'Track your 52-week English writing journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <header className="sticky top-0 z-10">
          <TabNav />
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
