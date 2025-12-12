'use client'

import { useState, useEffect, useRef } from 'react'
import { EyeIcon, ArrowPathIcon, DevicePhoneMobileIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

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

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const expensesRef = useRef<HTMLDivElement>(null)

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadExpenses(true) // Silent refresh
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading])

  // Charger les dépenses au démarrage
  useEffect(() => {
    loadExpenses()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Système de notifications Toast */}
      <div className="fixed top-20 right-24 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`backdrop-blur-xl rounded-2xl shadow-2xl border-2 p-4 min-w-[300px] max-w-md animate-slide-in-right ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              )}
              <p className="font-bold text-sm flex-1">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header moderne avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-100/90 border-b border-slate-300/50 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm bg-white/90 p-1.5 ring-2 ring-amber-300/50 border border-amber-200/30">
                <img 
                  src="/billz-logo.png" 
                  alt="Billz Logo" 
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-400"><span class="text-white text-2xl font-black">B</span></div>'
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-amber-600 to-slate-900 tracking-tight">
                  Dépenses
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Gestion des notes de frais
                  {isRefreshing && <span className="ml-2 animate-pulse">🔄</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12 relative z-10">
        {/* Liste des dépenses - Design moderne */}
        <div ref={expensesRef} className="backdrop-blur-xl bg-gradient-to-br from-slate-800/80 via-slate-800/70 to-slate-900/80 rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-500 ring-1 ring-white/10">
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-amber-400/80 to-yellow-400/80 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50 border border-amber-300/30">
                  <EyeIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Toutes les dépenses</h2>
                  <p className="text-sm text-slate-300 font-medium">
                    {expenses.length} dépense{expenses.length > 1 ? 's' : ''} reçue{expenses.length > 1 ? 's' : ''}
                    {lastRefresh && (
                      <span className="ml-2 text-xs text-slate-400">
                        • Dernière mise à jour: {formatTimeAgo(lastRefresh)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadExpenses()}
                disabled={loading}
                className="flex items-center gap-2.5 px-6 py-3.5 text-sm text-white backdrop-blur-sm bg-gradient-to-r from-yellow-400/80 to-amber-400/80 hover:from-yellow-500/90 hover:to-amber-500/90 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-black hover:scale-105 border border-yellow-300/30 ring-1 ring-yellow-200/20"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-700/50">
            {expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 backdrop-blur-sm bg-gradient-to-br from-slate-700/60 to-slate-600/60 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-600/50">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Aucune dépense reçue</p>
                <p className="text-sm text-slate-300 font-medium">Les dépenses apparaîtront ici automatiquement</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="p-8 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/40 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-400">
                          {expense.amount}€
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-md bg-gradient-to-r from-amber-500/50 to-yellow-500/50 border border-amber-400/70 text-amber-100 text-xs font-black rounded-full shadow-sm ring-1 ring-amber-300/30">
                          {expense.category}
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-sm bg-slate-700/40 border border-slate-600/60 text-slate-200 text-xs font-black rounded-full">
                          {expense.source}
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-sm bg-slate-700/40 border border-slate-600/60 text-slate-200 text-xs font-black rounded-full">
                          {Math.round(expense.confidence * 100)}% confiance
                        </span>
                      </div>
                      <p className="text-white font-black text-xl mb-2">{expense.merchant}</p>
                      <p className="text-sm text-slate-300 font-medium">{expense.description}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="backdrop-blur-sm bg-slate-700/40 p-5 rounded-2xl border border-slate-600/60 mt-4 shadow-sm">
                      <p className="text-sm text-slate-200 mb-2 font-medium">
                        <strong className="text-white font-black">Message original:</strong> &quot;{expense.original_message}&quot;
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                        <span>De:</span>
                        <span className="font-bold text-slate-300">{expense.whatsapp_from}</span>
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

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

