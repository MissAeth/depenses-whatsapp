/**
 * API Route pour traiter les images avec Gemini uniquement
 * Côté serveur uniquement pour la sécurité des clés API
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractWithAIVision } from '@/lib/ai-vision'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image manquante' },
        { status: 400 }
      )
    }

    // Vérifier que Gemini est configuré
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY non configurée. Veuillez configurer la clé API Gemini dans .env.local'
        },
        { status: 500 }
      )
    }

    console.log('🤖 Extraction avec Gemini...')
    console.log('  - Clé API:', process.env.GEMINI_API_KEY ? '✅ Présente' : '❌ Absente')
    console.log('  - Modèle:', process.env.GEMINI_MODEL || 'gemini-1.5-flash')

    // Utiliser Gemini uniquement
    const aiResult = await extractWithAIVision(imageBase64)
    
    console.log('✅ Données extraites par Gemini:', JSON.stringify(aiResult).substring(0, 200))
    
    return NextResponse.json({
      success: true,
      data: aiResult,
      method: 'gemini'
    })

  } catch (error) {
    console.error('❌ Erreur traitement image avec Gemini:', error)
    
    // Détecter les erreurs de quota pour un message plus clair
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    let userFriendlyMessage = errorMessage
    
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded')) {
      userFriendlyMessage = 'Quota API Gemini dépassé. Le plan gratuit a atteint sa limite quotidienne. Options:\n' +
        '1. Attendre quelques heures (le quota se réinitialise)\n' +
        '2. Passer à un plan payant sur https://ai.google.dev/\n' +
        '3. Utiliser une autre clé API Gemini\n\n' +
        'Détails techniques: ' + errorMessage.substring(0, 200)
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du traitement de l\'image avec Gemini',
        details: userFriendlyMessage
      },
      { status: 500 }
    )
  }
}

