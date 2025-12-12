import { NextResponse } from 'next/server'
import { testSupabaseConnection, saveExpenseToSupabase, getExpensesFromSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🧪 Test connexion Supabase...')
    
    // Test 1: Connexion basique
    const connectionOK = await testSupabaseConnection()
    if (!connectionOK) {
      return NextResponse.json({
        success: false,
        error: 'Connexion Supabase échoue - vérifier les variables SUPABASE_URL et SUPABASE_ANON_KEY'
      }, { status: 500 })
    }
    
    // Test 2: Récupération des dépenses existantes
    const expenses = await getExpensesFromSupabase(5)
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connecté avec succès !',
      connection: 'OK',
      existing_expenses: expenses.length,
      expenses: expenses.slice(0, 3), // Montrer 3 dernières dépenses
      supabase_url: process.env.SUPABASE_URL ? 'Configuré' : 'MANQUANT',
      supabase_key: process.env.SUPABASE_ANON_KEY ? 'Configuré' : 'MANQUANT'
    })
    
  } catch (error) {
    console.error('❌ Test Supabase échoué:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      supabase_url: process.env.SUPABASE_URL ? 'Configuré' : 'MANQUANT',
      supabase_key: process.env.SUPABASE_ANON_KEY ? 'Configuré' : 'MANQUANT'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Test d'insertion d'une dépense
    const testExpense = {
      expense_id: `test_${Date.now()}`,
      amount: 25.99,
      merchant: 'Restaurant Test Supabase',
      description: 'Test dépense Supabase',
      category: 'restauration',
      confidence: 0.95,
      raw_text: 'Test Restaurant 25.99€',
      whatsapp_from: '+33123456789',
      source: 'test'
    }
    
    const savedExpense = await saveExpenseToSupabase(testExpense)
    
    return NextResponse.json({
      success: true,
      message: 'Dépense test sauvegardée avec succès !',
      expense: savedExpense
    })
    
  } catch (error) {
    console.error('❌ Test insertion Supabase échoué:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur insertion test'
    }, { status: 500 })
  }
}