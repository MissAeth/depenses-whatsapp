'use client'

import { useState } from 'react'
import { PhotoCapture } from '@/components/PhotoCapture'
import { ExpenseForm } from '@/components/ExpenseForm'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const AnalyticsEmbed = dynamic(() => import('@/components/WhatsappAnalyticsPanel'), { ssr: false })
const ExpensesEmbed = dynamic(() => import('@/components/WhatsappExpensesPanel'), { ssr: false })

type Tab = 'expenses' | 'analytics'

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('expenses')
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const router = useRouter()

  // Charger l'info utilisateur au mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.phone) {
          setUserPhone(data.phone)
        }
      })
      .catch(() => {})
  }, [])

  // Hydrate activeTab from URL on client only
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const t = (url.searchParams.get('tab') || 'expenses') as Tab
    if (['expenses','analytics'].includes(t)) {
      setActiveTab(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push tab to URL when changed
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('tab', activeTab)
    router.replace(url.pathname + url.search)

    // Enforcer auth sur l'onglet Dépenses
    if (activeTab === 'expenses') {
      fetch('/api/auth/me').then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!data?.authenticated) {
          window.location.href = '/login'
        }
      }).catch(() => {
        window.location.href = '/login'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUserPhone(null)
      window.location.href = '/login'
    } catch (e) {
      console.error('Erreur logout:', e)
    }
  }

  const handleImageCapture = (imageUrl: string) => {
    console.log('📸 Image capturée:', imageUrl.substring(0, 50) + '...')
    setCapturedImage(imageUrl)
  }

  const handleCreateNewNote = () => {
    setCapturedImage(null)
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 relative overflow-hidden">
      {/* Effets de fond animés subtils */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Auth Banner moderne */}
        {userPhone && (
          <div className="mb-6 relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-blue-300/40 overflow-hidden">
            {/* Effet de reflet vitré */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
            <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-medium drop-shadow-sm">Connecté en tant que <strong className="font-bold">{userPhone}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/account"
                className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Mon compte
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Déconnexion
              </button>
            </div>
            </div>
          </div>
        )}

        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl border border-blue-300/40 overflow-hidden">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8 border-b border-white/20 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden bg-white/80 shadow-xl ring-2 ring-blue-200/50 p-1.5 hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <img 
                    src="/smart-expense-logo.png?v=2" 
                    alt="SmartExpense Logo" 
                    className="w-full h-full object-contain"
                    loading="eager"
                    onError={(e) => {
                      console.error('Erreur chargement logo:', e)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm truncate">SmartExpense</h1>
                  <p className="text-blue-50/95 mt-1 text-xs sm:text-sm font-medium">Gestion intelligente avec IA Gemini</p>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto inline-flex rounded-xl sm:rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md overflow-hidden shadow-lg p-0.5 sm:p-1">
              <button 
                id="tab-expenses" 
                onClick={() => setActiveTab('expenses')} 
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'expenses' 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-xl scale-105' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                Dépenses
              </button>
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'analytics' 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-xl scale-105' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
        </div>
        
        <div className="mt-6 relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl border border-blue-300/40 overflow-hidden">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="relative z-10 p-8 space-y-8">
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              {/* Formulaire de capture et création de dépense */}
              {!capturedImage ? (
                <PhotoCapture onImageCapture={handleImageCapture} />
              ) : (
                <div className="space-y-4">
                  <ExpenseForm
                    capturedImage={capturedImage}
                    userEmail="test@example.com"
                    onCreateNewNote={handleCreateNewNote}
                  />
                </div>
              )}
              
              {/* Séparateur visuel */}
              <div className="border-t border-white/20 my-6"></div>
              
              {/* Liste des dépenses */}
              <ExpensesEmbed />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              {/* Analytics embed */}
              <AnalyticsEmbed />
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  )
}