import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdServer Demo',
  description: 'Demo Ad Server Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
