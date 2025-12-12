"use client"

import { useEffect, useState, useRef } from "react"
import { DevicePhoneMobileIcon, EyeIcon, ArrowPathIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline"
import dynamic from 'next/dynamic'

const EditExpenseModal = dynamic(() => import('./EditExpenseModal'), { ssr: false })
const StatusBadge = dynamic(() => import('./StatusBadge'), { ssr: false })

export type Expense = {
  id: string
  amount: number
  merchant: string
  category: string | null
  description: string
  confidence?: number
  source?: string
  whatsapp_from?: string
  raw_text?: string
  received_at?: string
  processed_at?: string
  image_url?: string
  image_data?: string
  status?: 'brouillon' | 'validee' | 'rejetee'
  is_duplicate?: boolean
  duplicate_similarity?: number
}

type ApiResponse = {
  success: boolean
  expenses: any[]
  total: number
}

export default function WhatsappExpensesPanel() {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const skipNextLoad = useRef(false)

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [sort, setSort] = useState<'created_at' | 'amount' | 'received_at'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const loadExpenses = async (opts?: { resetPage?: boolean }) => {
    setLoading(true)
    try {
      const url = new URL('/api/whatsapp-expenses', window.location.origin)
      if (search) url.searchParams.set('q', search)
      if (category) url.searchParams.set('category', category)
      if (statusFilter) url.searchParams.set('status', statusFilter)
      if (start) url.searchParams.set('start', start)
      if (end) url.searchParams.set('end', end)
      if (sort) url.searchParams.set('sort', sort)
      if (order) url.searchParams.set('order', order)
      const currentPage = opts?.resetPage ? 1 : page
      url.searchParams.set('page', String(currentPage))
      url.searchParams.set('pageSize', String(pageSize))

      const res = await fetch(url.toString())
      const data: ApiResponse = await res.json()
      if (data.success) {
        const adapted = (data.expenses || []).map((expense: any) => ({
          id: expense.id,
          amount: expense.amount,
          merchant: expense.merchant,
          category: expense.category,
          description: expense.description,
          confidence: expense.confidence || 0,
          source: expense.source,
          whatsapp_from: expense.whatsapp_from,
          raw_text: expense.raw_text,
          received_at: expense.received_at,
          processed_at: expense.processed_at,
          image_url: expense.image_url,
          image_data: expense.image_data,
          status: expense.status || 'brouillon',
          is_duplicate: expense.is_duplicate || false,
          duplicate_similarity: expense.duplicate_similarity || 0
        })) as Expense[]
        
        // Détecter les doublons pour chaque dépense
        await detectDuplicatesForExpenses(adapted)
        
        setExpenses(adapted)
        setTotal(data.total || adapted.length)
        if (opts?.resetPage) setPage(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const detectDuplicatesForExpenses = async (expenseList: Expense[]) => {
    // Détecter les doublons pour chaque dépense en comparant avec les autres
    for (let i = 0; i < expenseList.length; i++) {
      const expense = expenseList[i]
      
      // Chercher des doublons potentiels
      for (let j = i + 1; j < expenseList.length; j++) {
        const other = expenseList[j]
        
        // Vérifier si même jour
        const expenseDate = expense.received_at ? new Date(expense.received_at).toDateString() : ''
        const otherDate = other.received_at ? new Date(other.received_at).toDateString() : ''
        
        if (expenseDate !== otherDate) continue
        
        // Vérifier montant (±5%)
        const amountDiff = Math.abs(expense.amount - other.amount) / expense.amount
        if (amountDiff > 0.05) continue
        
        // Calculer similarité du marchand
        const similarity = calculateMerchantSimilarity(expense.merchant, other.merchant)
        
        if (similarity >= 0.7) {
          // Marquer les deux comme doublons
          expense.is_duplicate = true
          expense.duplicate_similarity = Math.round(similarity * 100)
          other.is_duplicate = true
          other.duplicate_similarity = Math.round(similarity * 100)
        }
      }
    }
  }

  const calculateMerchantSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()
    
    if (s1 === s2) return 1.0
    if (s1.includes(s2) || s2.includes(s1)) return 0.8
    
    const words1 = s1.split(/\s+/)
    const words2 = s2.split(/\s+/)
    const commonWords = words1.filter(w => words2.includes(w))
    
    if (commonWords.length > 0) {
      return commonWords.length / Math.max(words1.length, words2.length)
    }
    
    return 0
  }

  useEffect(() => {
    if (skipNextLoad.current) {
      skipNextLoad.current = false
      return
    }
    loadExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, statusFilter, start, end, sort, order, page, pageSize])

  const handleSaveExpense = async (updated: Expense) => {
    try {
      const res = await fetch(`/api/expenses/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      const data = await res.json()
      console.log('API response:', data)
      if (data.success && data.expense) {
        // Bloquer le prochain useEffect
        skipNextLoad.current = true
        // Mettre à jour localement avec les données retournées par l'API
        setExpenses(prev => {
          const newExpenses = prev.map(e => e.id === updated.id ? data.expense : e)
          console.log('Updated expenses:', newExpenses.find(e => e.id === updated.id))
          return newExpenses
        })
        setEditingExpense(null)
      } else {
        alert('Erreur: ' + (data.error || 'Erreur inconnue'))
      }
    } catch (e) {
      alert('Erreur réseau')
      console.error(e)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        // Supprimer localement
        setExpenses(prev => prev.filter(e => e.id !== id))
        setEditingExpense(null)
        // Recharger pour être sûr
        loadExpenses()
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (e) {
      alert('Erreur réseau')
      console.error(e)
    }
  }

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
      <div className="p-4 md:p-6 border-b border-zinc-200">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              Liste des dépenses ({expenses.length}/{total})
            </h2>
            <button onClick={() => loadExpenses()} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            <input
              type="text"
              placeholder="Recherche (marchand, texte)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:col-span-2 p-2 border border-zinc-300 rounded"
            />
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full p-2 border border-zinc-300 rounded" />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full p-2 border border-zinc-300 rounded" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-zinc-300 rounded">
              <option value="">Toutes catégories</option>
              <option value="Restauration">Restauration</option>
              <option value="Transport">Transport</option>
              <option value="Divers">Divers</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-zinc-300 rounded">
              <option value="">Tous les statuts</option>
              <option value="brouillon">📝 Brouillon</option>
              <option value="validee">✓ Validée</option>
              <option value="rejetee">✗ Rejetée</option>
            </select>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:col-span-1">
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="w-full p-2 border border-zinc-300 rounded">
                <option value="created_at">Tri: Création</option>
                <option value="received_at">Tri: Reçu</option>
                <option value="amount">Tri: Montant</option>
              </select>
              <select value={order} onChange={(e) => setOrder(e.target.value as any)} className="w-full p-2 border border-zinc-300 rounded">
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 lg:col-span-6">
              <button onClick={() => loadExpenses({ resetPage: true })} className="px-3 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800">Appliquer</button>
              <button onClick={() => { setSearch(''); setCategory(''); setStart(''); setEnd(''); setSort('created_at'); setOrder('desc'); setPage(1); setPageSize(20); loadExpenses({ resetPage: true })}} className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-50">Réinitialiser</button>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <div>
              Page {page} / {Math.max(1, Math.ceil(total / pageSize))} — {total} résultats
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (page > 1) { setPage(page - 1); loadExpenses(); } }} disabled={page <= 1 || loading} className="px-2 py-1 border border-zinc-300 rounded disabled:opacity-50">Précédent</button>
              <button onClick={() => { const last = Math.max(1, Math.ceil(total / pageSize)); if (page < last) { setPage(page + 1); loadExpenses(); } }} disabled={page >= Math.max(1, Math.ceil(total / pageSize)) || loading} className="px-2 py-1 border border-zinc-300 rounded disabled:opacity-50">Suivant</button>
              <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); loadExpenses({ resetPage: true }) }} className="p-1 border border-zinc-300 rounded">
                {[10,20,50,100].map(s => (<option key={s} value={s}>{s}/page</option>))}
              </select>
              <button
                onClick={() => {
                  const u = new URL('/api/whatsapp-expenses/export', window.location.origin)
                  if (search) u.searchParams.set('q', search)
                  if (category) u.searchParams.set('category', category)
                  if (start) u.searchParams.set('start', start)
                  if (end) u.searchParams.set('end', end)
                  if (sort) u.searchParams.set('sort', sort)
                  if (order) u.searchParams.set('order', order)
                  u.searchParams.set('format','csv')
                  window.open(u.toString(), '_blank')
                }}
                className="px-3 py-1 border border-zinc-300 rounded hover:bg-zinc-50"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="divide-y divide-zinc-200">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <DevicePhoneMobileIcon className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p>Aucune dépense enregistrée</p>
            <p className="text-sm mt-1">Utilisez le webhook pour envoyer des dépenses</p>
          </div>
        ) : (
          <>
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                className="p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-lg font-semibold text-zinc-900">{expense.amount}€</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{expense.category}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">WhatsApp</span>
                      <StatusBadge status={expense.status} />
                      {expense.is_duplicate && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-medium" title={`Similarité: ${expense.duplicate_similarity}%`}>
                          ⚠️ Doublon possible
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 font-medium">{expense.merchant}</p>
                    <p className="text-sm text-zinc-500">{expense.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {(expense.image_data || expense.image_url) && (
                      <div className="flex-shrink-0">
                        <img
                          src={expense.image_data || expense.image_url}
                          alt="Ticket de dépense"
                          className="w-16 h-16 object-cover rounded-lg border border-zinc-200 cursor-pointer hover:opacity-80 transition"
                          title="Cliquez pour agrandir l'image"
                          onClick={(e) => {
                            e.stopPropagation()
                            const imgSrc = expense.image_data || expense.image_url
                            if (!imgSrc) return
                            setViewerSrc(imgSrc)
                          }}
                        />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingExpense(expense)
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border-2 border-blue-600/50 ring-2 ring-blue-500/30 relative overflow-hidden group"
                      title="Éditer cette dépense"
                    >
                      {/* Effet de brillance sur le bouton */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <PencilIcon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Éditer</span>
                    </button>
                  </div>
                  <div className="text-right text-sm text-zinc-500 flex-shrink-0 ml-4">
                    <p>Confiance: {Math.round((expense.confidence || 0) * 100)}%</p>
                    <p>
                      Reçu: {expense.received_at
                        ? new Date(expense.received_at).toLocaleDateString('fr-FR')
                        : 'Date inconnue'}
                    </p>
                  </div>
                </div>
                {expense.raw_text && (
                  <div className="bg-zinc-50 p-3 rounded text-sm">
                    <p className="text-zinc-600"><strong>Message original:</strong> "{expense.raw_text}"</p>
                    <p className="text-zinc-500 text-xs mt-1">De: {expense.whatsapp_from}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
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
            {/* Si data URL, on peut l'afficher directement */}
            <img src={viewerSrc} alt="Aperçu" className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </div>
      </div>
    )}

    {/* Modal d'édition */}
    {editingExpense && (
      <EditExpenseModal
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
      />
    )}
  </>
)
}
