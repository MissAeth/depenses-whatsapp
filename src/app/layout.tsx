import type { Metadata } from 'next'
// TEMPORAIRE - Clerk désactivé
// import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import NavigationMenu from '@/components/NavigationMenu'
import './globals.css'

export const metadata: Metadata = {
  title: 'Billz',
  description: "Application de gestion des notes de frais Billz",
  manifest: '/manifest.json',
}

// Provide a generateViewport function so Next can place theme-color metadata correctly
export function generateViewport(): any {
  return {
    // themeColor accepts a string or an array of descriptors; use descriptor form for clarity
    themeColor: [
      {
        color: '#18181B' // zinc-800
      }
    ]
  }
}

export default function RootLayout({
  children,
}: { readonly children: React.ReactNode }) {
  return (
    // TEMPORAIRE - Sans ClerkProvider pour test
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#18181B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Billz" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/billz-logo.png" />
        <link rel="apple-touch-icon" href="/billz-logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans">
        <div className="min-h-screen">
          {children}
        </div>
        <NavigationMenu />
        <SpeedInsights />
        <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(e=>console.log('SW registration failed',e));});}`}} />
      </body>
    </html>
  )
}