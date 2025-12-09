/**
 * API WhatsApp Webhook pour recevoir les messages avec photos de tickets
 * Intégration avec l'IA pour traitement automatique des dépenses
 */

import { NextRequest, NextResponse } from 'next/server'
import { processExpenseContent } from '@/lib/ai-processor'

// Interface pour les données WhatsApp reçues
interface WhatsAppMessage {
  from: string
  text?: string
  media?: {
    type: 'image' | 'document'
    url: string
    caption?: string
  }
  timestamp: string
}

// Stockage temporaire des dépenses (en production, utiliser une vraie DB)
const expenses: any[] = []

/**
 * Endpoint POST pour recevoir les webhooks WhatsApp
 */
export async function POST(req: NextRequest) {
  try {
    console.log('📱 Webhook WhatsApp reçu')
    
    const body = await req.json()
    console.log('📋 Données reçues:', body)
    
    // Simuler la réception d'un message WhatsApp avec image
    const message: WhatsAppMessage = {
      from: body.from || 'demo_user',
      text: body.text || body.message || '',
      media: body.media || (body.image_url ? {
        type: 'image',
        url: body.image_url,
        caption: body.caption
      } : undefined),
      timestamp: new Date().toISOString()
    }
    
    console.log('📨 Message traité:', message)
    
    // Détecter si c'est un message de dépense
    const isExpenseMessage = detectExpenseMessage(message)
    
    if (!isExpenseMessage) {
      return NextResponse.json({ 
        success: true, 
        message: 'Message ignoré (pas de dépense détectée)' 
      })
    }
    
    console.log('💰 Message de dépense détecté, traitement...')
    
    // Traiter avec l'IA
    let extractedData
    if (message.media?.type === 'image') {
      // Traitement image
      console.log('🖼️ Traitement image WhatsApp...')
      extractedData = await processExpenseContent(message.media.url)
    } else if (message.text) {
      // Traitement texte
      console.log('📝 Traitement texte WhatsApp...')
      extractedData = await processExpenseContent(undefined, message.text)
    } else {
      return NextResponse.json({ 
        error: 'Aucun contenu à traiter' 
      }, { status: 400 })
    }
    
    // Enrichir avec les métadonnées WhatsApp
    const expenseRecord = {
      id: Date.now().toString(),
      ...extractedData,
      source: 'whatsapp',
      whatsapp_from: message.from,
      original_message: message.text,
      received_at: message.timestamp,
      processed_at: new Date().toISOString()
    }
    
    // Sauvegarder (temporairement en mémoire)
    expenses.push(expenseRecord)
    console.log('✅ Dépense sauvegardée:', expenseRecord)
    
    // Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Dépense traitée et sauvegardée',
      expense_id: expenseRecord.id,
      extracted_data: extractedData
    })
    
  } catch (error) {
    console.error('❌ Erreur webhook WhatsApp:', error)
    return NextResponse.json({
      error: 'Erreur traitement webhook',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

/**
 * Endpoint GET pour récupérer les dépenses WhatsApp
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Retourner les dernières dépenses
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit)
    
    return NextResponse.json({
      success: true,
      expenses: recentExpenses,
      total: expenses.length
    })
    
  } catch (error) {
    console.error('❌ Erreur récupération dépenses:', error)
    return NextResponse.json({
      error: 'Erreur récupération données'
    }, { status: 500 })
  }
}

/**
 * Détecte si un message WhatsApp concerne une dépense
 */
function detectExpenseMessage(message: WhatsAppMessage): boolean {
  // Mots-clés de détection
  const expenseKeywords = [
    'dépense', 'ticket', 'facture', 'reçu', 'addition',
    'restaurant', 'taxi', 'hotel', 'carburant', 'course',
    '€', 'euro', 'eur', 'total', 'prix', 'montant'
  ]
  
  const textToCheck = (message.text || message.media?.caption || '').toLowerCase()
  
  // Présence d'image = probable dépense
  if (message.media?.type === 'image') {
    return true
  }
  
  // Vérifier les mots-clés dans le texte
  for (const keyword of expenseKeywords) {
    if (textToCheck.includes(keyword)) {
      return true
    }
  }
  
  // Pattern de prix dans le texte
  const pricePatterns = [
    /\d+[,\.]\d{2}\s*€/,
    /€\s*\d+[,\.]\d{2}/,
    /\d+[,\.]\d{2}\s*eur/i,
    /total[:\s]*\d+/i
  ]
  
  for (const pattern of pricePatterns) {
    if (pattern.test(textToCheck)) {
      return true
    }
  }
  
  return false
}

/**
 * Fonction de test pour simuler un message WhatsApp
 */
export async function simulateWhatsAppMessage(imageUrl?: string, text?: string) {
  const testMessage = {
    from: 'test_user',
    text: text || 'Test dépense restaurant 25€',
    media: imageUrl ? {
      type: 'image' as const,
      url: imageUrl,
      caption: 'Ticket restaurant'
    } : undefined,
    timestamp: new Date().toISOString()
  }
  
  console.log('🧪 Simulation message WhatsApp:', testMessage)
  return testMessage
}