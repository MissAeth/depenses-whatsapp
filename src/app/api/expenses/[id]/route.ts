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
        .maybeSingle()
      
      isAdmin = user?.role === 'admin'
    }

    // D'abord vérifier que la dépense existe et que l'utilisateur a les droits
    let checkQuery = supabase
      .from('whatsapp_expenses')
      .select('id')
      .eq('id', id)

    // Si pas admin, vérifier aussi le téléphone
    if (!isAdmin && userPhone) {
      checkQuery = checkQuery.eq('whatsapp_from', userPhone)
    }

    const { data: existingExpense, error: checkError } = await checkQuery.maybeSingle()

    if (checkError) {
      console.error('Erreur vérification dépense:', checkError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la vérification' }, { status: 500 })
    }

    if (!existingExpense) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense introuvable ou vous n\'avez pas les droits pour la modifier' 
      }, { status: 404 })
    }

    // Maintenant faire la mise à jour
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

    const { data: updatedData, error: updateError } = await updateQuery
      .select('*')

    if (updateError) {
      console.error('Erreur update Supabase:', updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    if (!updatedData || updatedData.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Aucune dépense mise à jour' 
      }, { status: 404 })
    }

    return NextResponse.json({ success: true, expense: updatedData[0] })
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
        .maybeSingle()
      
      isAdmin = user?.role === 'admin'
    }

    // D'abord vérifier que la dépense existe et que l'utilisateur a les droits
    let checkQuery = supabase
      .from('whatsapp_expenses')
      .select('id')
      .eq('id', id)

    // Si pas admin, vérifier aussi le téléphone
    if (!isAdmin && userPhone) {
      checkQuery = checkQuery.eq('whatsapp_from', userPhone)
    }

    const { data: existingExpense, error: checkError } = await checkQuery.maybeSingle()

    if (checkError) {
      console.error('Erreur vérification dépense:', checkError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la vérification' }, { status: 500 })
    }

    if (!existingExpense) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense introuvable ou vous n\'avez pas les droits pour la supprimer' 
      }, { status: 404 })
    }

    // Maintenant faire la suppression
    let deleteQuery = supabase
      .from('whatsapp_expenses')
      .delete()
      .eq('id', id)

    // Si pas admin, filtrer par téléphone (admin peut supprimer toutes les dépenses)
    if (!isAdmin && userPhone) {
      deleteQuery = deleteQuery.eq('whatsapp_from', userPhone)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      console.error('Erreur delete Supabase:', deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erreur DELETE expense:', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
