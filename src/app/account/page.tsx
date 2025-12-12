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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-600 hover:text-zinc-900 mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Mon compte</h1>
          <p className="text-zinc-600 mt-2">Gérez vos informations et découvrez comment utiliser SmartExpense</p>
        </div>

        {/* Profil */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Informations de profil</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
              <div>
                <div className="text-sm text-zinc-500">Numéro de téléphone</div>
                <div className="text-lg font-medium text-zinc-900">{userPhone}</div>
              </div>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
              <div>
                <div className="text-sm text-zinc-500">Statut</div>
                <div className="text-lg font-medium text-green-600">Connecté</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Guide WhatsApp */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <h2 className="text-xl font-semibold text-zinc-900">Comment envoyer vos dépenses via WhatsApp</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 mb-1">Prenez une photo du ticket</h3>
                <p className="text-sm text-zinc-600">Utilisez l'appareil photo de votre téléphone pour capturer le ticket de dépense (restaurant, transport, etc.)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 mb-1">Envoyez au numéro WhatsApp Business</h3>
                <p className="text-sm text-zinc-600">Ouvrez WhatsApp et envoyez la photo au numéro configuré pour SmartExpense</p>
                <div className="mt-2 p-3 bg-zinc-50 rounded border border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-1">Numéro WhatsApp Business</p>
                  <p className="font-mono text-sm text-zinc-900">+33 X XX XX XX XX</p>
                  <p className="text-xs text-zinc-500 mt-1">Contactez votre administrateur pour obtenir le numéro</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 mb-1">L'IA analyse automatiquement</h3>
                <p className="text-sm text-zinc-600">Notre IA Google Gemini extrait automatiquement le montant, le marchand, la catégorie et la date</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 mb-1">Retrouvez vos dépenses ici</h3>
                <p className="text-sm text-zinc-600">Toutes vos dépenses sont automatiquement enregistrées et accessibles dans l'onglet "Dépenses"</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Important</p>
                <p className="text-sm text-blue-800 mt-1">Utilisez le même numéro de téléphone ({userPhone}) pour envoyer vos tickets via WhatsApp. Vos dépenses seront automatiquement liées à votre compte.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Fonctionnalités disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">📸</div>
              <h3 className="font-medium text-zinc-900 mb-1">Capture web</h3>
              <p className="text-sm text-zinc-600">Uploadez vos tickets directement depuis l'interface web (onglet Accueil)</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-medium text-zinc-900 mb-1">WhatsApp</h3>
              <p className="text-sm text-zinc-600">Envoyez vos tickets par WhatsApp pour un traitement automatique</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-medium text-zinc-900 mb-1">IA Gemini</h3>
              <p className="text-sm text-zinc-600">Extraction intelligente des données (montant, marchand, catégorie)</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-zinc-900 mb-1">Analytics</h3>
              <p className="text-sm text-zinc-600">Visualisez vos dépenses par catégorie, date et marchand</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">📥</div>
              <h3 className="font-medium text-zinc-900 mb-1">Export CSV</h3>
              <p className="text-sm text-zinc-600">Exportez vos dépenses filtrées au format CSV</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-lg">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-medium text-zinc-900 mb-1">Données privées</h3>
              <p className="text-sm text-zinc-600">Vos dépenses sont isolées par compte, personne d'autre ne peut les voir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
