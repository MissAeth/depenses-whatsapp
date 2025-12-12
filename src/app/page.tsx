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
    <main className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Effets de fond animés modernes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/25 to-blue-500/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/30 to-blue-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Auth Banner moderne */}
        {userPhone && (
          <div className="mb-6 glass-modern rounded-2xl p-4 flex items-center justify-between shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/40">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-blue-800 font-medium">Connecté en tant que <strong className="text-blue-900 font-bold">{userPhone}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/account"
                className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 bg-white/60 hover:bg-white/80 border border-blue-200/50 rounded-xl hover:border-blue-300/70 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-sm"
              >
                Mon compte
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 bg-white/60 hover:bg-white/80 border border-blue-200/50 rounded-xl hover:border-blue-300/70 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}

        <div className="glass-modern rounded-3xl shadow-2xl overflow-hidden border border-white/40 hover:shadow-3xl transition-all duration-500">
          <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 p-8 border-b border-white/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-white/80 shadow-xl ring-2 ring-blue-200/50 p-1.5 hover:scale-110 transition-transform duration-300">
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
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">SmartExpense</h1>
                  <p className="text-blue-600/70 mt-1 text-sm font-medium">Gestion intelligente avec IA Gemini</p>
                </div>
              </div>
            </div>
            <div className="inline-flex rounded-2xl border border-blue-200/50 bg-white/60 backdrop-blur-md overflow-hidden shadow-lg p-1">
              <button 
                id="tab-expenses" 
                onClick={() => setActiveTab('expenses')} 
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'expenses' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'text-blue-700 hover:bg-blue-50/60 hover:text-blue-900'
                }`}
              >
                Dépenses
              </button>
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'analytics' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'text-blue-700 hover:bg-blue-50/60 hover:text-blue-900'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-8 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm">
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
              <div className="border-t border-zinc-200 my-6"></div>
              
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