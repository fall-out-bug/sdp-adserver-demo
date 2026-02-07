import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Advertiser Portal - Demo Ad Server',
  description: 'Manage your advertising campaigns',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
