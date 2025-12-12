import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API pour récupérer les dépenses WhatsApp avec filtres, tri et pagination
 * Query params (optionnels):
 * - q: recherche texte (merchant, description, raw_text)
 * - category: filtre catégorie
 * - start, end: bornes de date (sur received_at) en ISO
 * - sort: champ de tri (default: created_at)
 * - order: asc|desc (default: desc)
 * - page: numéro de page (default: 1)
 * - pageSize: (default: 20)
 */
export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: false, expenses: [], error: 'Supabase non configuré' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const start = searchParams.get('start') || ''
    const end = searchParams.get('end') || ''
    const sort = searchParams.get('sort') || 'created_at'
    const order = (searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20))

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Récupérer téléphone authentifié depuis l'en-tête (middleware)
    const userPhone = req.headers.get('x-user-phone') || ''

    // Vérifier si c'est un admin
    let isAdmin = false
    if (userPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .or(`phone.eq.${userPhone},phone.eq.+${userPhone}`)
        .single()
      
      isAdmin = user?.role === 'admin'
    }

    // Construction de la requête
    let query = supabase
      .from('whatsapp_expenses')
      .select('*', { count: 'exact' })

    // Filtrage par téléphone si connecté ET pas admin (admin voit tout)
    if (userPhone && !isAdmin) {
      query = query.eq('whatsapp_from', userPhone)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const status = req.nextUrl.searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }
    if (start) {
      query = query.gte('received_at', start)
    }
    if (end) {
      query = query.lte('received_at', end)
    }
    if (q) {
      // Recherche full-text naive sur 3 champs
      query = query.or(
        `merchant.ilike.%${q}%,description.ilike.%${q}%,raw_text.ilike.%${q}%`
      )
    }

    // Tri
    query = query.order(sort, { ascending: order === 'asc', nullsFirst: false })

    // Pagination
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      expenses: data || [],
      total: count || 0,
      page,
      pageSize,
      sort,
      order,
      filters: { q, category, start, end },
      source: 'supabase'
    })
  } catch (error) {
    console.error('❌ Erreur récupération dépenses:', error)
    return NextResponse.json({ success: false, expenses: [], error: 'Erreur récupération' }, { status: 500 })
  }
}

/**
 * API pour ajouter une dépense manuellement (test)
 */
export async function POST() {
  try {
    const testExpense = {
      id: `exp_${Date.now()}_test`,
      amount: 25.50,
      date: new Date().toISOString().split('T')[0],
      merchant: 'Restaurant Test',
      description: 'Dépense de test',
      category: 'restauration',
      source: 'test',
      phone: '+33123456789',
      timestamp: new Date().toISOString()
    }
    
    // Ajouter au stockage
    const globalStorage = (global as any)
    globalStorage.whatsappExpenses = globalStorage.whatsappExpenses || []
    globalStorage.whatsappExpenses.push(testExpense)
    
    console.log('✅ Dépense test ajoutée:', testExpense)
    
    return NextResponse.json({
      success: true,
      message: 'Dépense test ajoutée',
      expense: testExpense
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur ajout dépense test'
    })
  }
}