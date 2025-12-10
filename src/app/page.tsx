'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Préserver les paramètres de requête lors de la redirection
    const params = searchParams?.toString()
    const redirectUrl = params ? `/whatsapp?${params}` : '/whatsapp'
    router.replace(redirectUrl)
  }, [router, searchParams])

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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
