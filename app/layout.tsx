import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, JetBrains_Mono, Noto_Serif_Malayalam } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' })
const malayalam = Noto_Serif_Malayalam({
  subsets: ['malayalam'],
  display: 'swap',
  variable: '--font-malayalam',
})

export const metadata: Metadata = {
  title: 'Nayana',
  description: 'for nayana',
}

export const viewport: Viewport = {
  themeColor: '#120c08',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${mono.variable} ${malayalam.variable}`}
    >
      <body className="bg-roast font-sans text-crema antialiased">
        {children}
        <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[60]" />
      </body>
    </html>
  )
}
