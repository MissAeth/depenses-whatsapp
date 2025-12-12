import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT - Mettre à jour une dépense
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { amount, merchant, description, category, status, received_at } = body

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase non configuré' }, { status: 500 })
    }

    // Vérifier que l'utilisateur a le droit de modifier (via son téléphone)
    const userPhone = req.headers.get('x-user-phone') || ''
    
    // Vérifier si c'est un admin
    let isAdmin = false
    if (userPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .or(`phone.eq.${userPhone},phone.eq.+${userPhone}`)
        .single()
        .catch(() => ({ data: null }))
      
      isAdmin = user?.role === 'admin'
    }

    // Construire la requête de mise à jour
    let updateQuery = supabase
      .from('whatsapp_expenses')
      .update({
        amount: parseFloat(amount) || 0,
        merchant: merchant || '',
        description: description || '',
        category: category || null,
        status: status || 'brouillon',
        received_at: received_at || new Date().toISOString()
      })
      .eq('id', id)

    // Si pas admin, filtrer par téléphone (admin peut modifier toutes les dépenses)
    if (!isAdmin && userPhone) {
      updateQuery = updateQuery.eq('whatsapp_from', userPhone)
    }

    const { data, error } = await updateQuery
      .select('*')
      .single()

    if (error) {
      console.error('Erreur update Supabase:', error)
      // Si l'erreur est "PGRST116" (aucun résultat), c'est que la dépense n'existe pas ou n'appartient pas à l'utilisateur
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Dépense introuvable ou vous n\'avez pas les droits pour la modifier' 
        }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense introuvable ou vous n\'avez pas les droits pour la modifier' 
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, expense: data })
  } catch (e) {
    console.error('Erreur PUT expense:', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une dépense
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase non configuré' }, { status: 500 })
    }

    // Vérifier que l'utilisateur a le droit de supprimer (via son téléphone)
    const userPhone = req.headers.get('x-user-phone') || ''
    
    // Vérifier si c'est un admin
    let isAdmin = false
    if (userPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .or(`phone.eq.${userPhone},phone.eq.+${userPhone}`)
        .single()
        .catch(() => ({ data: null }))
      
      isAdmin = user?.role === 'admin'
    }

    // Construire la requête de suppression
    let deleteQuery = supabase
      .from('whatsapp_expenses')
      .delete()
      .eq('id', id)

    // Si pas admin, filtrer par téléphone (admin peut supprimer toutes les dépenses)
    if (!isAdmin && userPhone) {
      deleteQuery = deleteQuery.eq('whatsapp_from', userPhone)
    }

    const { error, count } = await deleteQuery

    if (error) {
      console.error('Erreur delete Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Vérifier si une ligne a été supprimée
    if (count === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense introuvable ou vous n\'avez pas les droits pour la supprimer' 
      }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erreur DELETE expense:', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
