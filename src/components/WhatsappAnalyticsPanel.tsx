"use client"

import { useEffect, useState } from "react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

type AnalyticsResponse = {
  success: boolean
  totals: { totalAmount: number; totalCount: number; avgAmount: number }
  byCategory: { category: string; amount: number; count: number }[]
  topMerchants: { merchant: string; amount: number; count: number }[]
  byDay: { date: string; amount: number; count: number }[]
}

export default function WhatsappAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp-analytics')
      const data: AnalyticsResponse = await res.json()
      if (data.success) setAnalytics(data)
    } catch (e) {
      console.error('Erreur analytics:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-900">Analytics</h2>
        <button onClick={loadAnalytics} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
  )
}
