/**
 * API WhatsApp Webhook pour recevoir les messages avec photos de tickets
 * Intégration avec l'IA pour traitement automatique des dépenses
 * Compatible WhatsApp Business API (Meta)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processExpenseContent } from '@/lib/ai-processor-unified'
import { saveExpenseToSupabase, type WhatsAppExpense } from '@/lib/supabase'

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
    console.log('📋 Données reçues:', JSON.stringify(body, null, 2))
    
    // Analyser la structure du webhook Meta WhatsApp
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages?.[0]
    
    if (!messages) {
      console.log('⚠️ Pas de message dans le webhook')
      return NextResponse.json({ success: true, message: 'Webhook reçu mais pas de message' })
    }
    
    console.log('📨 Message WhatsApp détecté:', {
      from: messages.from,
      type: messages.type,
      timestamp: messages.timestamp
    })
    
    // Extraire le message et media
    const normalize = (input: string) => {
      let digits = (input || '').replace(/\D/g, '')
      // Si commence par 0 (format français local), remplacer par 33
      if (digits.startsWith('0')) {
        digits = '33' + digits.substring(1)
      }
      // Si commence par 6 ou 7 sans indicatif (mobile français), ajouter 33
      else if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) {
        digits = '33' + digits
      }
      return digits
    }
    const message: WhatsAppMessage = {
      from: normalize(messages.from),
      text: messages.text?.body || '',
      timestamp: new Date(parseInt(messages.timestamp) * 1000).toISOString()
    }
    
    // Gérer les images
    if (messages.type === 'image' && messages.image?.id) {
      console.log('🖼️ Image reçue, téléchargement...')
      
      try {
        const imageBase64 = await downloadWhatsAppMedia(messages.image.id)
        message.media = {
          type: 'image',
          url: `data:image/jpeg;base64,${imageBase64}`,
          caption: messages.image.caption || ''
        }
        console.log('✅ Image téléchargée avec succès')
      } catch (error) {
        console.error('❌ Erreur téléchargement image:', error)
        console.error('📋 Détails erreur:', error instanceof Error ? error.message : 'Erreur inconnue')
        
        // En cas d'erreur image, traiter quand même le caption s'il existe
        if (messages.image?.caption) {
          console.log('📝 Fallback vers traitement du caption:', messages.image.caption)
          message.text = messages.image.caption
          console.log('📝 Caption assigné comme texte pour traitement IA')
        }
        
        // Ne pas arrêter le traitement, continuer avec le texte/caption
        console.log('⚠️ Continuation traitement sans image')
      }
    }
    
    console.log('📨 Message traité:', {
      from: message.from,
      hasText: !!message.text,
      hasMedia: !!message.media,
      timestamp: message.timestamp
    })
    
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
      console.log('📝 Texte à traiter:', message.text)
      extractedData = await processExpenseContent(undefined, message.text)
    } else {
      return NextResponse.json({ 
        error: 'Aucun contenu à traiter' 
      }, { status: 400 })
    }
    
    // Enrichir avec les métadonnées WhatsApp
    const expenseRecord: WhatsAppExpense = {
      expense_id: Date.now().toString(),
      amount: extractedData.amount || 0,
      merchant: extractedData.merchant || 'Inconnu',
      description: extractedData.description || message.text || '',
      category: extractedData.category || 'Divers',
      confidence: extractedData.confidence || 0,
      raw_text: message.text || '',
      whatsapp_from: message.from,
      source: 'whatsapp',
      received_at: message.timestamp,
      processed_at: new Date().toISOString()
    }
    
    // Sauvegarder (SUPABASE DATABASE - persistant)
    expenses.push(expenseRecord)
    
    try {
      // Sauvegarder dans Supabase (priorité)
      const savedExpense = await saveExpenseToSupabase(expenseRecord)
      console.log('✅ Dépense sauvegardée en BDD Supabase:', savedExpense)
    } catch (error) {
      console.error('⚠️ Échec Supabase, fallback fichier:', error)
      // Fallback: sauvegarder dans fichier temporaire
      await saveExpenseToFile(expenseRecord)
    }
    
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
 * Télécharge une image depuis l'API WhatsApp Business
 */
async function downloadWhatsAppMedia(mediaId: string): Promise<string> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN_CURRENT || process.env.WHATSAPP_ACCESS_TOKEN_UPDATED || process.env.WHATSAPP_ACCESS_TOKEN_NEW || process.env.WHATSAPP_ACCESS_TOKEN
  
  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN non configuré')
  }
  
  try {
    // 1. Obtenir l'URL du média
    console.log('📡 Récupération URL média ID:', mediaId)
    console.log('🔑 Token utilisé:', accessToken ? accessToken.substring(0, 20) + '...' : 'NON DÉFINI')
    
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.text()
      throw new Error(`Erreur récupération métadonnées: ${mediaResponse.status} - ${error}`)
    }
    
    const mediaData = await mediaResponse.json()
    console.log('📋 Métadonnées média:', {
      url: mediaData.url?.substring(0, 50) + '...',
      mimeType: mediaData.mime_type,
      size: mediaData.file_size
    })
    
    // 2. Télécharger le fichier
    console.log('⬇️ Téléchargement du fichier média...')
    const fileResponse = await fetch(mediaData.url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!fileResponse.ok) {
      throw new Error(`Erreur téléchargement fichier: ${fileResponse.status}`)
    }
    
    // 3. Convertir en base64
    const arrayBuffer = await fileResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    console.log('✅ Image convertie en base64, taille:', Math.round(base64.length / 1024), 'KB')
    return base64
    
  } catch (error) {
    console.error('❌ Erreur téléchargement média WhatsApp:', error)
    throw error
  }
}

// Modification de la fonction GET pour la vérification ET la récupération des dépenses
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  // Vérification webhook Meta (priorité)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  if (mode === 'subscribe') {
    console.log('🔍 Vérification webhook Meta:', { mode, token, challenge })
    
    // ACCEPTER TOUS LES TOKENS (mode debug temporaire)
    if (token && challenge) {
      console.log('✅ Webhook vérifié avec succès (mode permissif)')
      return new Response(challenge, { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } else {
      console.log('❌ Paramètres manquants:', { token: !!token, challenge: !!challenge })
      return new Response('Missing parameters', { status: 400 })
    }
  }
  
  // Si pas de vérification, récupérer les dépenses
  try {
    const limit = parseInt(searchParams.get('limit') || '10')
    
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
 * Sauvegarde une dépense dans le fichier JSON persistant
 */
async function saveExpenseToFile(expense: any): Promise<void> {
  try {
    const fs = await import('fs/promises')
    const path = '/tmp/whatsapp-expenses.json'
    
    // Lire les dépenses existantes
    let existingExpenses = []
    try {
      const data = await fs.readFile(path, 'utf-8')
      existingExpenses = JSON.parse(data)
    } catch {
      // Fichier n'existe pas, commencer avec tableau vide
      existingExpenses = []
    }
    
    // Ajouter la nouvelle dépense
    existingExpenses.push(expense)
    
    // Sauvegarder
    await fs.writeFile(path, JSON.stringify(existingExpenses, null, 2))
    console.log('💾 Dépense sauvegardée dans le fichier persistant')
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde fichier:', error)
  }
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