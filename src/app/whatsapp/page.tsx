'use client'

import { useState, useEffect } from 'react'
import { DevicePhoneMobileIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
  image_url?: string
  image_data?: string
}

interface AnalyticsResponse {
  success: boolean
  totals: { totalAmount: number; totalCount: number; avgAmount: number }
  byCategory: { category: string; amount: number; count: number }[]
  topMerchants: { merchant: string; amount: number; count: number }[]
  byDay: { date: string; amount: number; count: number }[]
}

export default function WhatsAppPage() {
  const [expenses, setExpenses] = useState<WhatsAppExpense[]>([])
  const [loading, setLoading] = useState(false)
  // Onglets
  const [activeTab, setActiveTab] = useState<'expenses' | 'analytics'>('expenses')

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [aLoading, setALoading] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [start, setStart] = useState('') // ISO date (YYYY-MM-DD)
  const [end, setEnd] = useState('')     // ISO date (YYYY-MM-DD)
  const [sort, setSort] = useState<'created_at' | 'amount' | 'received_at'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)

  useEffect(() => {
    loadExpenses()
    loadAnalytics()
  }, [])

  const loadExpenses = async (opts?: { resetPage?: boolean }) => {
    setLoading(true)
    try {
      const url = new URL('/api/whatsapp-expenses', window.location.origin)
      if (search) url.searchParams.set('q', search)
      if (category) url.searchParams.set('category', category)
      if (start) url.searchParams.set('start', start)
      if (end) url.searchParams.set('end', end)
      if (sort) url.searchParams.set('sort', sort)
      if (order) url.searchParams.set('order', order)
      const currentPage = opts?.resetPage ? 1 : page
      url.searchParams.set('page', String(currentPage))
      url.searchParams.set('pageSize', String(pageSize))

      const response = await fetch(url.toString())
      const data = await response.json()
      if (data.success) {
        const adaptedExpenses = data.expenses.map((expense: any) => ({
          id: expense.id,
          amount: expense.amount,
          merchant: expense.merchant,
          category: expense.category,
          description: expense.description,
          confidence: expense.confidence || 0,
          source: expense.source,
          whatsapp_from: expense.whatsapp_from,
          original_message: expense.raw_text,
          received_at: expense.received_at,
          processed_at: expense.processed_at,
          image_url: expense.image_url,
          image_data: expense.image_data
        }))
        setExpenses(adaptedExpenses)
        setTotal(data.total || adaptedExpenses.length)
        if (opts?.resetPage) setPage(1)
      }
    } catch (error) {
      console.error('Erreur chargement dépenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setALoading(true)
    try {
      const res = await fetch('/api/whatsapp-analytics')
      const data: AnalyticsResponse = await res.json()
      if (data.success) setAnalytics(data)
    } catch (e) {
      console.error('Erreur analytics:', e)
    } finally {
      setALoading(false)
    }
  }

  // simulateWhatsAppMessage supprimé (simulation désactivée)

  return (
    <>
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DevicePhoneMobileIcon className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-zinc-900">WhatsApp Dépenses</h1>
          </div>
          <p className="text-zinc-600">Testez la réception automatique de dépenses via WhatsApp</p>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-zinc-300 bg-white overflow-hidden">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 text-sm ${activeTab === 'expenses' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}
            >
              Dépenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm ${activeTab === 'analytics' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Analytics */}
        {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-900">Analytics</h2>
            <button onClick={loadAnalytics} disabled={aLoading} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50">
              <ArrowPathIcon className={`w-4 h-4 ${aLoading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
          </div>

          {!analytics ? (
            <div className="text-sm text-zinc-500">Chargement des analytics...</div>
          ) : (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border border-zinc-200 rounded-lg">
                  <div className="text-sm text-zinc-500">Total dépenses</div>
                  <div className="text-2xl font-semibold">{analytics.totals.totalAmount.toFixed(2)}€</div>
                </div>
                <div className="p-4 border border-zinc-200 rounded-lg">
                  <div className="text-sm text-zinc-500">Nombre</div>
                  <div className="text-2xl font-semibold">{analytics.totals.totalCount}</div>
                </div>
                <div className="p-4 border border-zinc-200 rounded-lg">
                  <div className="text-sm text-zinc-500">Moyenne</div>
                  <div className="text-2xl font-semibold">{analytics.totals.avgAmount.toFixed(2)}€</div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Dépenses par catégorie</h3>
                {analytics.byCategory.length === 0 ? (
                  <div className="text-sm text-zinc-500">Aucune donnée</div>
                ) : (
                  <div className="space-y-2">
                    {analytics.byCategory.map((c) => (
                      <div key={c.category} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-zinc-700">{c.category}</div>
                        <div className="flex-1 h-3 bg-zinc-100 rounded overflow-hidden">
                          <div className="h-3 bg-green-500" style={{ width: `${Math.min(100, (c.amount / Math.max(1, analytics.totals.totalAmount)) * 100)}%` }} />
                        </div>
                        <div className="w-28 text-right text-sm text-zinc-700">{c.amount.toFixed(2)}€</div>
                        <div className="w-16 text-right text-xs text-zinc-500">{c.count}x</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top merchants */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Top marchands</h3>
                {analytics.topMerchants.length === 0 ? (
                  <div className="text-sm text-zinc-500">Aucune donnée</div>
                ) : (
                  <div className="space-y-2">
                    {analytics.topMerchants.map((m) => (
                      <div key={m.merchant} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-zinc-700">{m.merchant}</div>
                        <div className="w-24 text-right text-sm text-zinc-700">{m.amount.toFixed(2)}€</div>
                        <div className="w-12 text-right text-xs text-zinc-500">{m.count}x</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trend */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Évolution quotidienne</h3>
                {analytics.byDay.length === 0 ? (
                  <div className="text-sm text-zinc-500">Aucune donnée</div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] grid grid-cols-12 gap-2">
                      {analytics.byDay.map((d) => (
                        <div key={d.date} className="flex flex-col items-center">
                          <div className="w-4 bg-blue-500 rounded" style={{ height: `${Math.min(120, d.amount)}px` }} />
                          <div className="text-[10px] text-zinc-500 mt-1">{d.date.slice(5)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Liste des dépenses */}
        {activeTab === 'expenses' && (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                  <EyeIcon className="w-5 h-5" />
                  Dépenses WhatsApp ({expenses.length}/{total})
                </h2>
                <button onClick={() => { loadExpenses(); loadAnalytics(); }} disabled={loading || aLoading} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50">
                  <ArrowPathIcon className={`w-4 h-4 ${(loading || aLoading) ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input
                  type="text"
                  placeholder="Recherche (marchand, texte)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="md:col-span-2 p-2 border border-zinc-300 rounded"
                />
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="p-2 border border-zinc-300 rounded"
                />
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="p-2 border border-zinc-300 rounded"
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border border-zinc-300 rounded">
                  <option value="">Toutes catégories</option>
                  <option value="Restauration">Restauration</option>
                  <option value="Transport">Transport</option>
                  <option value="Divers">Divers</option>
                </select>
                <div className="flex gap-2">
                  <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="p-2 border border-zinc-300 rounded">
                    <option value="created_at">Tri: Création</option>
                    <option value="received_at">Tri: Reçu</option>
                    <option value="amount">Tri: Montant</option>
                  </select>
                  <select value={order} onChange={(e) => setOrder(e.target.value as any)} className="p-2 border border-zinc-300 rounded">
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
                <div className="flex gap-2 md:col-span-6">
                  <button
                    onClick={() => loadExpenses({ resetPage: true })}
                    className="px-3 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800"
                  >
                    Appliquer
                  </button>
                  <button
                    onClick={() => { setSearch(''); setCategory(''); setStart(''); setEnd(''); setSort('created_at'); setOrder('desc'); setPage(1); setPageSize(20); loadExpenses({ resetPage: true })}}
                    className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-50"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <div>
                  Page {page} / {Math.max(1, Math.ceil(total / pageSize))} — {total} résultats
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (page > 1) { setPage(page - 1); loadExpenses(); } }}
                    disabled={page <= 1 || loading}
                    className="px-2 py-1 border border-zinc-300 rounded disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => { const last = Math.max(1, Math.ceil(total / pageSize)); if (page < last) { setPage(page + 1); loadExpenses(); } }}
                    disabled={page >= Math.max(1, Math.ceil(total / pageSize)) || loading}
                    className="px-2 py-1 border border-zinc-300 rounded disabled:opacity-50"
                  >
                    Suivant
                  </button>
                  <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); loadExpenses({ resetPage: true }) }} className="p-1 border border-zinc-300 rounded">
                    {[10, 20, 50, 100].map((s) => (
                      <option key={s} value={s}>{s}/page</option>
                    ))}
                  </select>
                </div>
              </div>
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
              <>
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold text-zinc-900">{expense.amount}€</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{expense.category}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">WhatsApp</span>
                        </div>
                        <p className="text-zinc-700 font-medium">{expense.merchant}</p>
                        <p className="text-sm text-zinc-500">{expense.description}</p>
                      </div>
                      {(expense.image_data || expense.image_url) && (
                        <div className="flex-shrink-0 mr-4">
                          <img
                            src={expense.image_data || expense.image_url}
                            alt="Ticket de dépense"
                            className="w-16 h-16 object-cover rounded-lg border border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const imgSrc = expense.image_data || expense.image_url
                              if (!imgSrc) return
                              setViewerSrc(imgSrc)
                            }}
                            title="Cliquez pour agrandir l'image"
                          />
                          {expense.image_data && (
                            <div className="text-xs text-center text-zinc-400 mt-1">📸</div>
                          )}
                        </div>
                      )}
                      <div className="text-right text-sm text-zinc-500 flex-shrink-0">
                        <p>Confiance: {Math.round((expense.confidence || 0) * 100)}%</p>
                        <p>Reçu: {expense.received_at ? new Date(expense.received_at).toLocaleString('fr-FR') : 'Date inconnue'}</p>
                      </div>
                    </div>
                    {expense.original_message && (
                      <div className="bg-zinc-50 p-3 rounded text-sm">
                        <p className="text-zinc-600"><strong>Message original:</strong> "{expense.original_message}"</p>
                        <p className="text-zinc-500 text-xs mt-1">De: {expense.whatsapp_from}</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        )}
        {/* Aide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Aide</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Filtrez par date, catégorie ou mot-clé pour affiner les résultats</p>
            <p>• Triez par date de création, date de réception ou montant</p>
            <p>• Utilisez la pagination et changez la taille de page selon vos besoins</p>
          </div>
        </div>
      </div>
    </div>

    {/* Image Viewer Modal */}
    {viewerSrc && (
      <div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={() => setViewerSrc(null)}
      >
        <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setViewerSrc(null)}
            className="absolute -top-3 -right-3 bg-white text-zinc-700 rounded-full p-2 shadow hover:bg-zinc-100"
            aria-label="Fermer"
            title="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="bg-white rounded-lg overflow-hidden">
            <img src={viewerSrc} alt="Aperçu" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      </div>
    )}
  </>
)
}
