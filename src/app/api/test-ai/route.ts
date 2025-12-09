/**
 * Route de test pour vérifier la configuration de l'IA
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasGemini = !!process.env.GEMINI_API_KEY
  
  return NextResponse.json({
    openai: {
      configured: hasOpenAI,
      keyPreview: hasOpenAI && process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : null
    },
    gemini: {
      configured: hasGemini,
      keyPreview: hasGemini && process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : null,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    },
    activeProvider: hasOpenAI ? 'openai' : (hasGemini ? 'gemini' : 'none')
  })
}

