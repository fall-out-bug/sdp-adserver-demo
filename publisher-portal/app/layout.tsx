import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Demo AdServer - Publisher Portal',
  description: 'Monetize your website in 5 minutes',
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
