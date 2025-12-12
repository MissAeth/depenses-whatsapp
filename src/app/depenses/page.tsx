'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, ArrowPathIcon, DevicePhoneMobileIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { isAuthenticated } from '@/lib/auth'

interface Expense {
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

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const expensesRef = useRef<HTMLDivElement>(null)

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
    setCheckingAuth(false)
  }, [router])

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (checkingAuth) return
    
    const interval = setInterval(() => {
      if (!loading) {
        loadExpenses(true) // Silent refresh
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading, checkingAuth])

  // Charger les dépenses au démarrage (seulement si authentifié)
  useEffect(() => {
    if (!checkingAuth && isAuthenticated()) {
      loadExpenses()
    }
  }, [checkingAuth])

  // Scroll vers le haut quand une nouvelle dépense arrive
  useEffect(() => {
    if (expenses.length > 0 && expensesRef.current) {
      const observer = new MutationObserver(() => {
        expensesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      observer.observe(expensesRef.current, { childList: true })
      return () => observer.disconnect()
    }
  }, [expenses.length])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove après 4 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const loadExpenses = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setIsRefreshing(true)
    }
    
    try {
      const response = await fetch('/api/whatsapp')
      const data = await response.json()
      
      if (data.success) {
        const previousCount = expenses.length
        setExpenses(data.expenses)
        setLastRefresh(new Date())
        
        // Notification si nouvelle dépense
        if (!silent && data.expenses.length > previousCount) {
          const newCount = data.expenses.length - previousCount
          showToast(`✨ ${newCount} nouvelle${newCount > 1 ? 's' : ''} dépense${newCount > 1 ? 's' : ''} reçue${newCount > 1 ? 's' : ''} !`, 'success')
        }
      } else {
        if (!silent) {
          showToast('❌ Erreur lors du chargement des dépenses', 'error')
        }
      }
    } catch (error) {
      console.error('Erreur chargement dépenses:', error)
      if (!silent) {
        showToast('❌ Erreur de connexion', 'error')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'à l\'instant'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours}h`
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Afficher un loader pendant la vérification de l'authentification
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Système de notifications Toast */}
        <div className="fixed top-20 right-4 md:right-24 left-4 md:left-auto z-50 space-y-3 max-w-sm md:max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`bg-white rounded-lg border shadow-sm p-4 min-w-[300px] max-w-md ${
                toast.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-zinc-200 text-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : toast.type === 'error' ? (
                  <XCircleIcon className="w-6 h-6 text-rose-600 flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                  </div>
                )}
                <p className="font-medium text-sm flex-1">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src="/smart-expense-logo.png" 
                      alt="SmartExpense Logo" 
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  </div>
                  <h1 className="text-2xl font-semibold text-zinc-900">SmartExpense</h1>
                </div>
                <p className="text-zinc-500 mt-2">
                  Gestion des notes de frais
                  {isRefreshing && <span className="ml-2 animate-pulse">🔄</span>}
                </p>
              </div>
              <button
                onClick={() => loadExpenses()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des dépenses */}
        <div ref={expensesRef} className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <EyeIcon className="w-6 h-6 text-zinc-700" />
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Toutes les dépenses</h2>
                <p className="text-sm text-zinc-500">
                  {expenses.length} dépense{expenses.length > 1 ? 's' : ''} reçue{expenses.length > 1 ? 's' : ''}
                  {lastRefresh && (
                    <span className="ml-2 text-xs">
                      • Dernière mise à jour: {formatTimeAgo(lastRefresh)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-zinc-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-zinc-400" />
                </div>
                <p className="text-zinc-900 font-semibold text-lg mb-2">Aucune dépense reçue</p>
                <p className="text-sm text-zinc-500">Les dépenses apparaîtront ici automatiquement</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="p-6 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-3xl font-semibold text-zinc-900">
                          {expense.amount}€
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full">
                          {expense.category}
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full">
                          {expense.source}
                        </span>
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full">
                          {Math.round(expense.confidence * 100)}% confiance
                        </span>
                      </div>
                      <p className="text-zinc-900 font-semibold text-lg mb-1 break-words">{expense.merchant}</p>
                      <p className="text-sm text-zinc-600 break-words">{expense.description}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 mt-4">
                      <p className="text-sm text-zinc-700 mb-2 break-words">
                        <strong className="text-zinc-900 font-semibold">Message original:</strong> &quot;{expense.original_message}&quot;
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-2 flex-wrap">
                        <span>De:</span>
                        <span className="font-medium text-zinc-700">{expense.whatsapp_from}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(expense.received_at).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
