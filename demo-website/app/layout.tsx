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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { background: #fff; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section { margin-bottom: 40px; }
          .banner-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; justify-content: center; }
          .banner-slot { border: 1px solid #e5e7eb; border-radius: 4px; }
          .loading { color: #9ca3af; text-align: center; padding: 20px; }
          pre { background: #1f2937; color: #f3f4f6; padding: 20px; border-radius: 8px; overflow-x: auto; }
          h1 { margin: 0; font-size: 24px; }
          h2 { font-size: 28px; margin-bottom: 10px; }
          h3 { font-size: 18px; margin-bottom: 15px; }
          p { color: #4b5563; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
