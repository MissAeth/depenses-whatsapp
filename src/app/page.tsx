'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { InstallPrompt } from '@/components/InstallPrompt'
import Image from 'next/image'
import { 
  HomeIcon, 
  DevicePhoneMobileIcon, 
  SignalIcon,
  SignalSlashIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  // Mode démo pour test local
  const isSignedIn = true
  const user = { emailAddresses: [{ emailAddress: 'demo@example.com' }] }
  const isLoaded = true
  const isDemoMode = true
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const initialBranch = 'Groupe'
  const [activeBranch, setActiveBranch] = useState<string>(initialBranch)
  const [activeTab, setActiveTab] = useState<'home' | 'whatsapp'>('home')
  const isOnline = useOnlineStatus()

  // Afficher un loader pendant le chargement
  if (!isLoaded && !isDemoMode) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <div className="text-zinc-600 text-sm">Chargement…</div>
        </div>
      </main>
    )
  }

  // Page de connexion (si nécessaire)
  if (!isSignedIn && !isDemoMode) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={32} height={32} className="rounded-sm" />
              <h1 className="text-2xl font-bold">Factures SGDF</h1>
            </div>
            <p className="text-zinc-300 text-sm">La Guillotière</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-zinc-600 mb-6">
              Connectez-vous pour accéder à l&apos;application de gestion des factures.
            </p>
            <button className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all transform hover:scale-[1.02]">
              Se connecter
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* Header moderne avec navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Mes Dépenses</h1>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <SignalIcon className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">En ligne</span>
                    </>
                  ) : (
                    <>
                      <SignalSlashIcon className="w-3 h-3 text-amber-600" />
                      <span className="text-amber-600">Hors ligne</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/whatsapp"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <DevicePhoneMobileIcon className="w-4 h-4" />
                WhatsApp
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-zinc-700">👤</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière de statut hors ligne */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center text-sm py-2 px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
              <SignalSlashIcon className="w-4 h-4" />
              <span>Mode hors ligne - certaines fonctionnalités sont limitées</span>
            </div>
          </div>
        )}

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden">
          {/* Section d'information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-zinc-900 mb-1">Gestion intelligente des dépenses</h2>
                <p className="text-sm text-zinc-600">
                  Capturez une photo de votre facture et l&apos;IA extrait automatiquement les informations. 
                  Envoyez également vos dépenses via WhatsApp pour un traitement automatique.
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="p-6 space-y-6">
            <PhotoCapture
              onImageCapture={setCapturedImage}
            />

            {capturedImage && (
              <div className="animate-fade-in">
                <ExpenseForm
                  capturedImage={capturedImage}
                  userEmail={isDemoMode ? 'demo@example.com' : user?.emailAddresses[0]?.emailAddress || ''}
                  initialBranch={isDemoMode ? 'Groupe' : initialBranch}
                  onCreateNewNote={() => {
                    setCapturedImage(null)
                  }}
                  onPersistBranch={isDemoMode ? undefined : async (branch: string) => {
                    try {
                      const res = await fetch('/api/update-branch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ branch })
                      })
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}))
                        throw new Error(data.error || 'Erreur API')
                      }
                    } catch (e) {
                      console.error('Erreur de sauvegarde de la branche', e)
                    }
                  }}
                  onBranchChange={(b) => setActiveBranch(b)}
                  isOnline={isOnline}
                />
              </div>
            )}

            {!capturedImage && (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-10 h-10 text-zinc-400" />
                </div>
                <p className="text-zinc-500 text-sm">
                  Commencez par capturer ou importer une photo de votre justificatif de dépense
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section d'aide rapide */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              IA Automatique
            </h3>
            <p className="text-sm text-zinc-600">
              L&apos;intelligence artificielle extrait automatiquement le montant, le marchand et la catégorie depuis votre photo.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
            <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
              WhatsApp
            </h3>
            <p className="text-sm text-zinc-600">
              Envoyez vos dépenses directement via WhatsApp pour un traitement automatique en temps réel.
            </p>
          </div>
        </div>
      </div>

      <InstallPrompt />
    </main>
  )
}