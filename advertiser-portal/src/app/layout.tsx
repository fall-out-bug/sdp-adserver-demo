import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers/Providers';

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
