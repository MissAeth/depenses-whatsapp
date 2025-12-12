import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Analytics endpoint for WhatsApp expenses
 * Query params (optional):
 * - start: ISO date string
 * - end: ISO date string
 * - limit: number of rows to process (default 1000)
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase non configuré' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10) || 1000, 5000)

    // Build query
    let query = supabase
      .from('whatsapp_expenses')
      .select('amount, merchant, category, received_at')
      .order('received_at', { ascending: false })
      .limit(limit)

    if (start) {
      query = query.gte('received_at', start)
    }
    if (end) {
      query = query.lte('received_at', end)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Supabase analytics error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const rows = (data || []).filter((r) => typeof r.amount === 'number' && !isNaN(r.amount)) as Array<{
      amount: number
      merchant: string | null
      category: string | null
      received_at: string | null
    }>

    // Aggregations
    const totalCount = rows.length
    const totalAmount = rows.reduce((sum, r) => sum + (r.amount || 0), 0)
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0

    // By category
    const byCategoryMap = new Map<string, { category: string; amount: number; count: number }>()
    for (const r of rows) {
      const cat = (r.category || 'Divers').trim()
      const key = cat.toLowerCase() || 'divers'
      const item = byCategoryMap.get(key) || { category: cat || 'Divers', amount: 0, count: 0 }
      item.amount += r.amount || 0
      item.count += 1
      byCategoryMap.set(key, item)
    }
    const byCategory = Array.from(byCategoryMap.values()).sort((a, b) => b.amount - a.amount)

    // Top merchants
    const merchantsMap = new Map<string, { merchant: string; amount: number; count: number }>()
    for (const r of rows) {
      const merch = (r.merchant || 'Inconnu').trim()
      const key = merch.toLowerCase() || 'inconnu'
      const item = merchantsMap.get(key) || { merchant: merch || 'Inconnu', amount: 0, count: 0 }
      item.amount += r.amount || 0
      item.count += 1
      merchantsMap.set(key, item)
    }
    const topMerchants = Array.from(merchantsMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Daily trend (by received_at date)
    const dayMap = new Map<string, { date: string; amount: number; count: number }>()
    for (const r of rows) {
      if (!r.received_at) continue
      const d = new Date(r.received_at)
      if (isNaN(d.getTime())) continue
      const key = d.toISOString().slice(0, 10)
      const item = dayMap.get(key) || { date: key, amount: 0, count: 0 }
      item.amount += r.amount || 0
      item.count += 1
      dayMap.set(key, item)
    }
    const byDay = Array.from(dayMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1))

    return NextResponse.json({
      success: true,
      range: { start: start || null, end: end || null },
      totals: { totalAmount, totalCount, avgAmount },
      byCategory,
      topMerchants,
      byDay,
      sample: rows.length,
      limit
    })
  } catch (error) {
    console.error('❌ Analytics error:', error)
    return NextResponse.json({ success: false, error: 'Erreur analytics' }, { status: 500 })
  }
}
