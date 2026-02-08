import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AdServer Demo - Monetize Your Traffic',
  description: 'Demo website showcasing AdServer SDK capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
