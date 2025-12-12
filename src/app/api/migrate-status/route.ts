import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API de migration pour ajouter la colonne status
 * À appeler une seule fois : GET /api/migrate-status
 */
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase non configuré' 
      }, { status: 500 })
    }

    // Vérifier si la colonne existe déjà en essayant une requête
    const { data: testData, error: testError } = await supabase
      .from('whatsapp_expenses')
      .select('status')
      .limit(1)

    if (!testError) {
      return NextResponse.json({ 
        success: true, 
        message: 'La colonne status existe déjà ✅',
        alreadyExists: true
      })
    }

    // Si l'erreur indique que la colonne n'existe pas, on doit l'ajouter manuellement
    return NextResponse.json({ 
      success: false, 
      message: '⚠️ La colonne status doit être ajoutée manuellement via Supabase Dashboard',
      instructions: 'Aller sur Supabase Dashboard → SQL Editor → Exécuter le SQL ci-dessous',
      sql: `
-- Ajouter la colonne status
ALTER TABLE whatsapp_expenses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'brouillon' 
CHECK (status IN ('brouillon', 'validee', 'rejetee'));

-- Mettre à jour les dépenses existantes
UPDATE whatsapp_expenses 
SET status = 'brouillon' 
WHERE status IS NULL;
      `,
      dashboardUrl: 'https://supabase.com/dashboard/project/djqrupuytjqpajoquejl/editor'
    })
  } catch (e) {
    console.error('Erreur migration:', e)
    return NextResponse.json({ 
      success: false, 
      error: e instanceof Error ? e.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
}
