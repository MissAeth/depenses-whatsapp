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
    
    const { data, error } = await supabase
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
      .eq('whatsapp_from', userPhone) // Sécurité : ne modifier que ses propres dépenses
      .select('*')
      .single()

    if (error) {
      console.error('Erreur update Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
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
    
    const { error } = await supabase
      .from('whatsapp_expenses')
      .delete()
      .eq('id', id)
      .eq('whatsapp_from', userPhone) // Sécurité : ne supprimer que ses propres dépenses

    if (error) {
      console.error('Erreur delete Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erreur DELETE expense:', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
