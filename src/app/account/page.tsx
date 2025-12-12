'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.phone) {
          setUserPhone(data.phone)
        } else {
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (e) {
      console.error('Erreur logout:', e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Effets de fond animés subtils */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        </div>
        <div className="text-blue-700 font-medium">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 relative overflow-hidden">
      {/* Effets de fond animés subtils */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-700 hover:text-blue-900 mb-4 flex items-center gap-1 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </button>
          <h1 className="text-3xl font-bold text-blue-900">Mon compte</h1>
          <p className="text-blue-700/80 mt-2">Gérez vos informations et découvrez comment utiliser SmartExpense</p>
        </div>

        {/* Profil */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl border border-blue-300/40 overflow-hidden p-6 mb-6">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white drop-shadow-sm mb-4">Informations de profil</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                <div>
                  <div className="text-sm text-blue-50/90">Numéro de téléphone</div>
                  <div className="text-lg font-medium text-white drop-shadow-sm">{userPhone}</div>
                </div>
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                <div>
                  <div className="text-sm text-blue-50/90">Statut</div>
                  <div className="text-lg font-medium text-white drop-shadow-sm">Connecté</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] border-2 border-blue-600/50 ring-2 ring-blue-500/30 relative overflow-hidden group"
              >
                {/* Effet de brillance sur le bouton */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guide WhatsApp */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl border border-blue-300/40 overflow-hidden p-6 mb-6">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <h2 className="text-xl font-semibold text-white drop-shadow-sm">Comment envoyer vos dépenses via WhatsApp</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-semibold border border-white/30">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-white drop-shadow-sm mb-1">Prenez une photo du ticket</h3>
                  <p className="text-sm text-blue-50/95">Utilisez l'appareil photo de votre téléphone pour capturer le ticket de dépense (restaurant, transport, etc.)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-semibold border border-white/30">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-white drop-shadow-sm mb-1">Envoyez au numéro WhatsApp Business</h3>
                  <p className="text-sm text-blue-50/95">Ouvrez WhatsApp et envoyez la photo au numéro configuré pour SmartExpense</p>
                  <div className="mt-2 p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                    <p className="text-xs text-blue-50/90 mb-1">Numéro WhatsApp Business</p>
                    <p className="font-mono text-sm text-white drop-shadow-sm">+33 X XX XX XX XX</p>
                    <p className="text-xs text-blue-50/90 mt-1">Contactez votre administrateur pour obtenir le numéro</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-semibold border border-white/30">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-white drop-shadow-sm mb-1">L'IA analyse automatiquement</h3>
                  <p className="text-sm text-blue-50/95">Notre IA Google Gemini extrait automatiquement le montant, le marchand, la catégorie et la date</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-semibold border border-white/30">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-white drop-shadow-sm mb-1">Retrouvez vos dépenses ici</h3>
                  <p className="text-sm text-blue-50/95">Toutes vos dépenses sont automatiquement enregistrées et accessibles dans l'onglet "Dépenses"</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-white drop-shadow-sm">Important</p>
                  <p className="text-sm text-blue-50/95 mt-1">Utilisez le même numéro de téléphone ({userPhone}) pour envoyer vos tickets via WhatsApp. Vos dépenses seront automatiquement liées à votre compte.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl border border-blue-300/40 overflow-hidden p-6">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white drop-shadow-sm mb-4">Fonctionnalités disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">📸</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">Capture web</h3>
                <p className="text-sm text-blue-50/95">Uploadez vos tickets directement depuis l'interface web (onglet Accueil)</p>
              </div>
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">WhatsApp</h3>
                <p className="text-sm text-blue-50/95">Envoyez vos tickets par WhatsApp pour un traitement automatique</p>
              </div>
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">IA Gemini</h3>
                <p className="text-sm text-blue-50/95">Extraction intelligente des données (montant, marchand, catégorie)</p>
              </div>
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">Analytics</h3>
                <p className="text-sm text-blue-50/95">Visualisez vos dépenses par catégorie, date et marchand</p>
              </div>
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">📥</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">Export CSV</h3>
                <p className="text-sm text-blue-50/95">Exportez vos dépenses filtrées au format CSV</p>
              </div>
              <div className="p-4 border border-white/30 bg-white/10 backdrop-blur-md rounded-xl">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-medium text-white drop-shadow-sm mb-1">Données privées</h3>
                <p className="text-sm text-blue-50/95">Vos dépenses sont isolées par compte, personne d'autre ne peut les voir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
