'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection côté client vers WhatsApp
    router.replace('/whatsapp')
  }, [router])

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Redirection vers WhatsApp...</p>
      </div>
    </div>
  )
}

