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
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-5xl mx-auto">
        {/* Auth Banner */}
        {userPhone && (
          <div className="mb-4 bg-white border border-zinc-200 rounded-lg shadow-sm p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Connecté en tant que <strong className="text-zinc-900">{userPhone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/account"
                className="px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Mon compte
              </a>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-900 rounded flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <h1 className="text-2xl font-semibold text-zinc-900">SmartExpense</h1>
              </div>
              <p className="text-zinc-500 mt-2">Gestion intelligente avec IA Gemini</p>
            </div>
            <div className="inline-flex rounded-lg border border-zinc-300 bg-white overflow-hidden">
              <button id="tab-expenses" onClick={() => setActiveTab('expenses')} className={`px-4 py-2 text-sm ${activeTab === 'expenses' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}>Dépenses</button>
              <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm ${activeTab === 'analytics' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}>Analytics</button>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
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