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
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 relative overflow-hidden">
      {/* Effets de fond animés subtils */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Système de notifications Toast */}
        <div className="fixed top-20 right-4 md:right-24 left-4 md:left-auto z-50 space-y-3 max-w-sm md:max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`backdrop-blur-xl rounded-xl border shadow-xl p-4 min-w-[300px] max-w-md ${
                toast.type === 'success'
                  ? 'border-emerald-200/50 bg-emerald-50/80 text-emerald-900'
                  : toast.type === 'error'
                  ? 'border-rose-200/50 bg-rose-50/80 text-rose-900'
                  : 'border-blue-200/50 bg-white/80 text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : toast.type === 'error' ? (
                  <XCircleIcon className="w-6 h-6 text-rose-600 flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                )}
                <p className="font-medium text-sm flex-1">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header moderne */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl overflow-hidden mb-8 border border-blue-300/40">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10 p-8 border-b border-white/20 backdrop-blur-sm">
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
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">SmartExpense</h1>
                    <p className="text-blue-50/95 mt-1 text-sm font-medium">
                      Gestion des notes de frais
                      {isRefreshing && <span className="ml-2 animate-pulse">🔄</span>}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => loadExpenses()}
                disabled={loading}
                className="flex items-center gap-2.5 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 disabled:transform-none border-2 border-blue-600/50 ring-2 ring-blue-500/30 relative overflow-hidden group"
              >
                {/* Effet de brillance sur le bouton */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <ArrowPathIcon className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                <span className="relative z-10">Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des dépenses moderne */}
        <div ref={expensesRef} className="relative backdrop-blur-xl bg-gradient-to-br from-blue-400/60 via-blue-500/55 to-blue-600/60 rounded-3xl shadow-2xl overflow-hidden border border-blue-300/40">
          {/* Effet de reflet vitré */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="relative z-10 p-8 border-b border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200/50">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">Toutes les dépenses</h2>
                <p className="text-sm text-blue-50/95 font-medium">
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

          <div className="relative z-10 divide-y divide-white/20">
            {expenses.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
                  <DevicePhoneMobileIcon className="w-14 h-14 text-white" />
                </div>
                <p className="text-white font-bold text-xl mb-2 drop-shadow-sm">Aucune dépense reçue</p>
                <p className="text-sm text-blue-50/95">Les dépenses apparaîtront ici automatiquement</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="p-8 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-4xl font-bold text-white drop-shadow-lg">
                          {expense.amount}€
                        </span>
                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30 shadow-sm">
                          {expense.category}
                        </span>
                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30 shadow-sm">
                          {expense.source}
                        </span>
                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30 shadow-sm">
                          {Math.round(expense.confidence * 100)}% confiance
                        </span>
                      </div>
                      <p className="text-white font-bold text-xl mb-2 break-words drop-shadow-sm">{expense.merchant}</p>
                      <p className="text-sm text-blue-50/95 break-words">{expense.description}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="bg-white/20 backdrop-blur-md p-5 rounded-xl border border-white/30 mt-5 shadow-sm">
                      <p className="text-sm text-white mb-2 break-words drop-shadow-sm">
                        <strong className="font-bold">Message original:</strong> &quot;{expense.original_message}&quot;
                      </p>
                      <p className="text-xs text-blue-50/90 flex items-center gap-2 flex-wrap">
                        <span>De:</span>
                        <span className="font-semibold">{expense.whatsapp_from}</span>
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
