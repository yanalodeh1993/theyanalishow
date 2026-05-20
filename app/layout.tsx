import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Yanali Show',
  description: 'Gaming. Adventure. The open road. — TheYanaliShow',
  openGraph: {
    title: 'The Yanali Show',
    description: 'Competitive gaming meets van life adventure. Watch live on Twitch, YouTube, and TikTok.',
    url: 'https://theyanalishow.com',
    siteName: 'The Yanali Show',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
