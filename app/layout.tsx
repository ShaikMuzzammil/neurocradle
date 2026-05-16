// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { CursorSystem } from '@/components/ui/CursorSystem'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'NeuroCradle — AI Hand-Tracking Interface',
  description: 'Real-time AI hand tracking, gesture classification, and developer tools.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Exo+2:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CursorSystem />
        <main>{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(5, 10, 26, 0.9)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: '#e0e8ff',
              fontFamily: 'Exo 2, sans-serif',
              backdropFilter: 'blur(12px)',
            },
            success: { iconTheme: { primary: '#00F5FF', secondary: '#050A1A' } },
            error: { iconTheme: { primary: '#FF00FF', secondary: '#050A1A' } },
          }}
        />
      </body>
    </html>
  )
}