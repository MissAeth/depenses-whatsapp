'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DevicePhoneMobileIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface WhatsAppExpense {
  id: string
  amount: number
  merchant: string
  category: string
  description: string
  confidence: number
  source: string
  whatsapp_from: string
  original_message?: string
  received_at: string
  processed_at: string
}

export default function WhatsAppPage() {
  const [expenses, setExpenses] = useState<WhatsAppExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResult, setTestResult] = useState('')

  // Charger les dépenses au démarrage
  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp')
      const data = await response.json()
      
      if (data.success) {
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error('Erreur chargement dépenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateWhatsAppMessage = async () => {
    if (!testMessage.trim()) return

    setLoading(true)
    setTestResult('')

    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'test_user',
          message: testMessage,
          timestamp: new Date().toISOString()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult(`✅ Succès: ${data.message}`)
        setTestMessage('')
        // Recharger les dépenses
        await loadExpenses()
      } else {
        setTestResult(`❌ Erreur: ${data.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      setTestResult(`❌ Erreur réseau: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm mb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">WhatsApp Dépenses</h1>
                <p className="text-xs text-zinc-500">Réception automatique de dépenses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">

        {/* Zone de test */}
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Simulateur WhatsApp</h2>
              <p className="text-sm text-zinc-500">Testez la réception automatique de dépenses</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="test-message" className="block text-sm font-medium text-zinc-700 mb-2">
                Message de test
              </label>
              <div className="flex gap-2">
                <input
                  id="test-message"
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Ex: Restaurant Le Bistrot 25.50€"
                  className="flex-1 p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-zinc-300 shadow-sm"
                />
                <button
                  onClick={simulateWhatsAppMessage}
                  disabled={loading || !testMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                  Envoyer
                </button>
              </div>
            </div>

            {/* Exemples de messages */}
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-2">Exemples à tester:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Restaurant Le Petit Bistrot 23.50€",
                  "Taxi aéroport 45€", 
                  "dépense essence 67.30€",
                  "Hotel Berlin 120€/nuit",
                  "ticket restaurant voir photo"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setTestMessage(example)}
                    className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded text-sm hover:bg-zinc-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Résultat du test */}
            {testResult && (
              <div className={`p-3 rounded-lg text-sm ${
                testResult.startsWith('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Liste des dépenses */}
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 animate-fade-in">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <EyeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Dépenses WhatsApp</h2>
                  <p className="text-sm text-zinc-500">{expenses.length} dépense{expenses.length > 1 ? 's' : ''} reçue{expenses.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={loadExpenses}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:text-zinc-900 border-2 border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {expenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DevicePhoneMobileIcon className="w-10 h-10 text-zinc-400" />
                </div>
                <p className="text-zinc-600 font-medium mb-1">Aucune dépense WhatsApp reçue</p>
                <p className="text-sm text-zinc-500">Testez avec le simulateur ci-dessus</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="p-6 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors animate-slide-up">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl font-bold text-zinc-900">
                          {expense.amount}€
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {expense.category}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          WhatsApp
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {Math.round(expense.confidence * 100)}% confiance
                        </span>
                      </div>
                      <p className="text-zinc-900 font-semibold text-lg mb-1">{expense.merchant}</p>
                      <p className="text-sm text-zinc-600">{expense.description}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 p-4 rounded-xl border border-zinc-200 mt-3">
                      <p className="text-sm text-zinc-700 mb-2">
                        <strong className="text-zinc-900">Message original:</strong> &quot;{expense.original_message}&quot;
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <span>De:</span>
                        <span className="font-medium">{expense.whatsapp_from}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(expense.received_at).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>Instructions d&apos;usage</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="font-semibold text-blue-900 mb-1">Test local</p>
              <p>Utilisez le simulateur ci-dessus pour tester</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="font-semibold text-blue-900 mb-1">WhatsApp réel</p>
              <p>Configurez un webhook pointant vers /api/whatsapp</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="font-semibold text-blue-900 mb-1">Mots-clés détectés</p>
              <p>dépense, ticket, facture, restaurant, taxi, €, etc.</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="font-semibold text-blue-900 mb-1">Images supportées</p>
              <p>Photos de tickets automatiquement traitées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}