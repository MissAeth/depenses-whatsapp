import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return 'id,expense_id,amount,merchant,description,category,confidence,raw_text,whatsapp_from,source,received_at,processed_at,created_at,image_url\n'
  const headers = [
    'id','expense_id','amount','merchant','description','category','confidence','raw_text','whatsapp_from','source','received_at','processed_at','created_at','image_url'
  ]
  const escape = (val: any) => {
    if (val === null || val === undefined) return ''
    const s = String(val).replace(/\r?\n|\r/g, ' ').replace(/"/g, '""')
    if (s.includes(',') || s.includes('"')) return `"${s}"`
    return s
  }
  const headerLine = headers.join(',')
  const lines = rows.map((r) => headers.map((h) => escape(r[h])).join(','))
  return [headerLine, ...lines].join('\n') + '\n'
}

export async function GET(req: NextRequest) {
  if (!supabase) {
    return new NextResponse('Supabase non configuré', { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const start = searchParams.get('start') || ''
    const end = searchParams.get('end') || ''
    const sort = searchParams.get('sort') || 'created_at'
    const order = (searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
    const format = (searchParams.get('format') || 'csv').toLowerCase()

    // Récupérer jusqu'à 5000 lignes pour export
    let query = supabase
      .from('whatsapp_expenses')
      .select('*')

    if (category) query = query.eq('category', category)
    if (start) query = query.gte('received_at', start)
    if (end) query = query.lte('received_at', end)
    if (q) {
      query = query.or(`merchant.ilike.%${q}%,description.ilike.%${q}%,raw_text.ilike.%${q}%`)
    }

    query = query.order(sort, { ascending: order === 'asc' }).limit(5000)

    const { data, error } = await query
    if (error) throw error

    // Actuellement, support CSV uniquement
    const csv = toCSV(data || [])
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="whatsapp-expenses_${Date.now()}.csv"`
      }
    })
  } catch (err) {
    console.error('Export error:', err)
    return new NextResponse('Erreur export', { status: 500 })
  }
}
