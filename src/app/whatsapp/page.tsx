'use client'

import { useState, useEffect } from 'react'
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
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DevicePhoneMobileIcon className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-zinc-900">WhatsApp Dépenses</h1>
          </div>
          <p className="text-zinc-600">
            Testez la réception automatique de dépenses via WhatsApp
          </p>
        </div>

        {/* Zone de test */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5" />
            Simulateur WhatsApp
          </h2>
          
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
                  className="flex-1 p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
                <button
                  onClick={simulateWhatsAppMessage}
                  disabled={loading || !testMessage.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                <EyeIcon className="w-5 h-5" />
                Dépenses WhatsApp ({expenses.length})
              </h2>
              <button
                onClick={loadExpenses}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <DevicePhoneMobileIcon className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                <p>Aucune dépense WhatsApp reçue</p>
                <p className="text-sm mt-1">Testez avec le simulateur ci-dessus</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-zinc-900">
                          {expense.amount}€
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {expense.category}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          WhatsApp
                        </span>
                      </div>
                      <p className="text-zinc-700 font-medium">{expense.merchant}</p>
                      <p className="text-sm text-zinc-500">{expense.description}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-500">
                      <p>Confiance: {Math.round(expense.confidence * 100)}%</p>
                      <p>Reçu: {new Date(expense.received_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="bg-zinc-50 p-3 rounded text-sm">
                      <p className="text-zinc-600">
                        <strong>Message original:</strong> "{expense.original_message}"
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">
                        De: {expense.whatsapp_from}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Instructions d'usage</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Test local:</strong> Utilisez le simulateur ci-dessus pour tester</p>
            <p>• <strong>WhatsApp réel:</strong> Configurez un webhook sur votre serveur pointant vers /api/whatsapp</p>
            <p>• <strong>Mots-clés détectés:</strong> dépense, ticket, facture, restaurant, taxi, €, etc.</p>
            <p>• <strong>Images supportées:</strong> Photos de tickets automatiquement traitées</p>
          </div>
        </div>
      </div>
    </div>
  )
}