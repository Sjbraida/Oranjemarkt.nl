import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AiAssistant } from '@/components/ai-assistant'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'OranjeMarkt — De digitale bazaar van Nederland',
  description:
    'Huur jouw digitale kraam op OranjeMarkt en verkoop aan heel Nederland. Duizenden zelfstandige winkels onder één dak. Geen commissie over jouw verkopen.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'dark',
  themeColor: '#ff9800',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={`dark ${inter.variable}`}>
      <body className="bg-background font-sans antialiased">
        {children}
        <AiAssistant />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
