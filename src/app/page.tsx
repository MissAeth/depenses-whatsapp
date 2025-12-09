'use client'

import { useState, useEffect } from 'react'
// TEMPORAIRE - Hooks Clerk désactivés
// import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { InstallPrompt } from '@/components/InstallPrompt'
import Image from 'next/image'

export default function Home() {
  // TEMPORAIRE - Variables mock pour test sans Clerk
  const isSignedIn = true // Force signed in for demo
  const user = { emailAddresses: [{ emailAddress: 'demo@example.com' }] }
  const isLoaded = true
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const initialBranch = 'Groupe' // Default branch for demo
  const [activeBranch, setActiveBranch] = useState<string>(initialBranch)
  const isOnline = useOnlineStatus()

  // Update activeBranch when user metadata loads (disabled for demo)
  // useEffect(() => {
  //   if (user?.publicMetadata?.branch) {
  //     setActiveBranch(user.publicMetadata.branch as string)
  //   }
  // }, [user?.publicMetadata?.branch])

  // TEMPORAIRE - Contourner Clerk pour test
  const isDemoMode = true;
  
  // Afficher un loader pendant le chargement de l'état d'authentification
  if (!isLoaded && !isDemoMode) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    )
  }

  // Afficher la page de connexion si l'utilisateur n'est pas connecté
  if (!isSignedIn && !isDemoMode) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Factures carte procurement SGDF</h1>
            </div>
            <p className="text-center text-zinc-500 mt-2">
              La Guillotière
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-zinc-600 mb-6">
              Connectez-vous pour accéder à l&apos;application de gestion des factures carte procurement.
            </p>
            {/* TEMPORAIRE - SignInButton désactivé */}
            <button className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors">
              Se connecter (Demo)
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white p-6 border-b border-zinc-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-900 rounded flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <h1 className="text-2xl font-semibold text-zinc-900">Mes Dépenses</h1>
              </div>
              <p className="text-zinc-500 mt-2">Gestion intelligente avec IA + WhatsApp</p>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/whatsapp"
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                📱 WhatsApp
              </a>
              {/* TEMPORAIRE - UserButton désactivé */}
              <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">👤</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isOnline && (
          <div className="bg-amber-50 border-t border-b border-amber-200 text-amber-800 text-center text-sm py-2">
            Hors ligne - certaines fonctionnalités sont limitées
          </div>
        )}

        <div className="p-6 space-y-6">
          <PhotoCapture
            onImageCapture={setCapturedImage}
          />

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
                console.error('Erreur de sauvegarde de la branche dans Clerk', e)
              }
            }}
            onBranchChange={(b) => setActiveBranch(b)}
            isOnline={isOnline}
          />
        </div>
      </div>
      <InstallPrompt />
    </main>
  )
}