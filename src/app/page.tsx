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
    <main className="min-h-screen p-4 relative">
      {/* Effets de fond animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Auth Banner */}
        {userPhone && (
          <div className="mb-4 backdrop-blur-xl bg-white/70 border border-blue-200/50 rounded-xl shadow-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Connecté en tant que <strong className="text-blue-900">{userPhone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/account"
                className="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 border border-blue-300/50 rounded-lg hover:bg-blue-50/50 backdrop-blur-sm transition-all"
              >
                Mon compte
              </a>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 border border-blue-300/50 rounded-lg hover:bg-blue-50/50 backdrop-blur-sm transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/80 rounded-xl border border-blue-200/50 shadow-xl overflow-hidden">
          <div className="backdrop-blur-sm bg-gradient-to-r from-blue-50/50 to-blue-100/30 p-6 border-b border-blue-200/30">
            <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded flex items-center justify-center overflow-hidden">
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
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">SmartExpense</h1>
              </div>
              <p className="text-blue-600/80 mt-2">Gestion intelligente avec IA Gemini</p>
            </div>
            <div className="inline-flex rounded-lg border border-blue-300/50 bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm">
              <button id="tab-expenses" onClick={() => setActiveTab('expenses')} className={`px-4 py-2 text-sm transition-all ${activeTab === 'expenses' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-blue-700 hover:bg-blue-50/50'}`}>Dépenses</button>
              <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-blue-700 hover:bg-blue-50/50'}`}>Analytics</button>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6 bg-white/40 backdrop-blur-sm">
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