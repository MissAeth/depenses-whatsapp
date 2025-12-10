/**
 * API WhatsApp Webhook pour recevoir les messages avec photos de tickets
 * Intégration avec l'API Meta WhatsApp Business Platform
 * Compatible avec le format Meta et le simulateur local
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractWithAIVision } from '@/lib/ai-vision'

// Interface pour les données WhatsApp reçues (format simplifié)
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

// Interface pour le format Meta
interface MetaWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: string
      metadata: {
        display_phone_number: string
        phone_number_id: string
      }
      contacts?: Array<{
        profile: {
          name: string
        }
        wa_id: string
      }>
      messages?: Array<{
        from: string
        id: string
        timestamp: string
        type: string
        text?: {
          body: string
        }
        image?: {
          id: string
          mime_type?: string
          caption?: string
          sha256?: string
        }
        document?: {
          id: string
          filename?: string
          mime_type?: string
        }
      }>
      statuses?: Array<unknown>
    }
    field: string
  }>
}

// Stockage temporaire des dépenses (en production, utiliser une vraie DB)
const expenses: any[] = []

/**
 * Récupère un média depuis l'API Meta WhatsApp
 */
async function fetchMediaFromMeta(mediaId: string): Promise<string> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN non configuré')
  }

  if (!phoneNumberId) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID non configuré')
  }

  try {
    // Étape 1: Récupérer l'URL du média
    const mediaUrlResponse = await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    if (!mediaUrlResponse.ok) {
      const errorText = await mediaUrlResponse.text()
      throw new Error(`Erreur récupération URL média: ${mediaUrlResponse.status} - ${errorText}`)
    }

    const mediaData = await mediaUrlResponse.json()
    const mediaUrl = mediaData.url

    if (!mediaUrl) {
      throw new Error('URL média non trouvée dans la réponse Meta')
    }

    // Étape 2: Télécharger le média avec l'access token
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!mediaResponse.ok) {
      throw new Error(`Erreur téléchargement média: ${mediaResponse.status}`)
    }

    // Étape 3: Convertir en base64
    const arrayBuffer = await mediaResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    
    // Déterminer le type MIME
    const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg'
    const base64DataUrl = `data:${contentType};base64,${base64String}`

    console.log(`✅ Média récupéré depuis Meta: ${mediaId} (${buffer.length} bytes)`)
    return base64DataUrl

  } catch (error) {
    console.error('❌ Erreur récupération média Meta:', error)
    throw error
  }
}

/**
 * Parse un webhook Meta en format simplifié
 */
function parseMetaWebhook(body: { entry?: MetaWebhookEntry[] }): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []

  if (!body.entry || !Array.isArray(body.entry)) {
    return messages
  }

  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) {
      continue
    }

    for (const change of entry.changes) {
      if (change.field !== 'messages') {
        continue
      }

      const value = change.value
      if (!value.messages || !Array.isArray(value.messages)) {
        continue
      }

      for (const metaMessage of value.messages) {
        // Ignorer les statuses (messages de statut, pas des messages utilisateur)
        if (metaMessage.type === 'status') {
          continue
        }

        const message: WhatsAppMessage = {
          from: metaMessage.from,
          timestamp: new Date(parseInt(metaMessage.timestamp) * 1000).toISOString()
        }

        // Message texte
        if (metaMessage.text) {
          message.text = metaMessage.text.body
        }

        // Message avec image
        if (metaMessage.image) {
          message.media = {
            type: 'image',
            url: metaMessage.image.id, // On stocke l'ID, on récupérera le média après
            caption: metaMessage.image.caption
          }
        }

        // Message avec document
        if (metaMessage.document) {
          message.media = {
            type: 'document',
            url: metaMessage.document.id, // On stocke l'ID, on récupérera le média après
            caption: metaMessage.document.filename
          }
        }

        messages.push(message)
      }
    }
  }

  return messages
}

/**
 * Endpoint GET pour la vérification du webhook Meta
 * Meta envoie une requête GET pour vérifier que le webhook est valide
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    // Vérification du webhook Meta
    if (mode === 'subscribe' && token) {
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

      if (!verifyToken) {
        console.warn('⚠️ WHATSAPP_VERIFY_TOKEN non configuré, webhook Meta non vérifié')
        return new NextResponse('Verify token not configured', { status: 403 })
      }

      if (token === verifyToken) {
        console.log('✅ Webhook Meta vérifié avec succès')
        return new NextResponse(challenge, { status: 200 })
      } else {
        console.warn('❌ Token de vérification invalide')
        return new NextResponse('Invalid verify token', { status: 403 })
      }
    }

    // Si ce n'est pas une requête de vérification Meta, retourner les dépenses (compatibilité)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
      .slice(0, limit)
    
    return NextResponse.json({
      success: true,
      expenses: recentExpenses,
      total: expenses.length
    })

  } catch (error) {
    console.error('❌ Erreur GET webhook:', error)
    return NextResponse.json({
      error: 'Erreur récupération données'
    }, { status: 500 })
  }
}

/**
 * Endpoint POST pour recevoir les webhooks WhatsApp
 * Gère à la fois le format Meta et le format du simulateur local
 */
export async function POST(req: NextRequest) {
  try {
    console.log('📱 Webhook WhatsApp reçu')
    
    const body = await req.json()
    console.log('📋 Données reçues:', JSON.stringify(body).substring(0, 500))

    let messages: WhatsAppMessage[] = []

    // Détecter le format Meta (présence de "entry")
    if (body.entry && Array.isArray(body.entry)) {
      console.log('📦 Format Meta détecté')
      messages = parseMetaWebhook(body)
    } else {
      // Format simulateur local (compatibilité)
      console.log('📦 Format simulateur local détecté')
      const message: WhatsAppMessage = {
        from: body.from || 'demo_user',
        text: body.text || body.message || '',
        media: body.media || (body.image_url ? {
          type: 'image',
          url: body.image_url,
          caption: body.caption
        } : undefined) || (body.imageBase64 ? {
          type: 'image',
          url: body.imageBase64, // Déjà en base64
          caption: body.text || body.message || ''
        } : undefined),
        timestamp: body.timestamp || new Date().toISOString()
      }
      messages = [message]
    }

    if (messages.length === 0) {
      console.log('⚠️ Aucun message trouvé dans le webhook')
      return NextResponse.json({
        success: true,
        message: 'Aucun message à traiter'
      })
    }

    // Traiter chaque message
    const results = []
    for (const message of messages) {
      console.log('📨 Traitement message:', {
        from: message.from,
        hasText: !!message.text,
        hasMedia: !!message.media
      })

      // Détecter si c'est un message de dépense
      const isExpenseMessage = detectExpenseMessage(message)
      
      if (!isExpenseMessage) {
        console.log('⏭️ Message ignoré (pas de dépense détectée)')
        results.push({
          success: true,
          message: 'Message ignoré (pas de dépense détectée)'
        })
        continue
      }

      console.log('💰 Message de dépense détecté, traitement...')
      
      // Traiter avec l'IA
      let extractedData
      let imageBase64: string | null = null

      // Gérer les médias
      if (message.media) {
        const mediaIdOrUrl = message.media.url

        // Si c'est un ID Meta (format numérique), récupérer depuis l'API Meta
        if (/^\d+$/.test(mediaIdOrUrl)) {
          try {
            console.log(`🔄 Récupération média Meta: ${mediaIdOrUrl}`)
            imageBase64 = await fetchMediaFromMeta(mediaIdOrUrl)
          } catch (error) {
            console.error('❌ Erreur récupération média Meta:', error)
            results.push({
              success: false,
              error: 'Erreur récupération média depuis Meta',
              details: error instanceof Error ? error.message : 'Erreur inconnue'
            })
            continue
          }
        } 
        // Si c'est déjà du base64 (simulateur)
        else if (mediaIdOrUrl.startsWith('data:image/')) {
          console.log('✅ Image déjà en base64')
          imageBase64 = mediaIdOrUrl
        }
        // Si c'est une URL, télécharger
        else if (mediaIdOrUrl.startsWith('http')) {
          console.log('🖼️ Téléchargement image depuis URL:', mediaIdOrUrl)
          try {
            const imageResponse = await fetch(mediaIdOrUrl)
            if (!imageResponse.ok) {
              throw new Error(`Erreur téléchargement: ${imageResponse.status}`)
            }
            
            const imageBuffer = await imageResponse.arrayBuffer()
            const imageBase64String = Buffer.from(imageBuffer).toString('base64')
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
            imageBase64 = `data:${contentType};base64,${imageBase64String}`
            
            console.log('✅ Image téléchargée et convertie en base64')
          } catch (error) {
            console.error('❌ Erreur téléchargement image:', error)
            results.push({
              success: false,
              error: 'Erreur téléchargement image',
              details: error instanceof Error ? error.message : 'Erreur inconnue'
            })
            continue
          }
        }

        // Traitement avec Gemini si on a une image
        if (imageBase64) {
          try {
            console.log('🤖 Traitement image avec Gemini...')
            extractedData = await extractWithAIVision(imageBase64)
            console.log('✅ Données extraites par Gemini:', extractedData)
          } catch (error) {
            console.error('❌ Erreur traitement image avec Gemini:', error)
            results.push({
              success: false,
              error: 'Erreur traitement image avec Gemini',
              details: error instanceof Error ? error.message : 'Erreur inconnue'
            })
            continue
          }
        }
      }
      // Message texte uniquement
      else if (message.text) {
        console.log('📝 Traitement message texte uniquement...')
        try {
          const { processExpenseContent } = await import('@/lib/ai-processor')
          extractedData = await processExpenseContent(undefined, message.text)
          console.log('✅ Données extraites du texte:', extractedData)
          imageBase64 = null
        } catch (error) {
          console.error('❌ Erreur traitement texte:', error)
          results.push({
            success: false,
            error: 'Erreur traitement texte',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
          })
          continue
        }
      } else {
        results.push({
          success: false,
          error: 'Aucun contenu à traiter. Veuillez envoyer une image de ticket ou un message texte.'
        })
        continue
      }

      // Enrichir avec les métadonnées WhatsApp
      const expenseRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...extractedData,
        source: 'whatsapp',
        whatsapp_from: message.from,
        original_message: message.text || message.media?.caption || '',
        received_at: message.timestamp,
        processed_at: new Date().toISOString(),
        imageBase64: imageBase64 || null
      }

      console.log('💾 Dépense à sauvegarder:', {
        id: expenseRecord.id,
        amount: expenseRecord.amount,
        merchant: expenseRecord.merchant,
        category: expenseRecord.category,
        hasImage: !!imageBase64
      })

      // Sauvegarder (temporairement en mémoire)
      expenses.push(expenseRecord)
      console.log('✅ Dépense sauvegardée:', expenseRecord.id)

      results.push({
        success: true,
        message: 'Dépense traitée et sauvegardée',
        expense_id: expenseRecord.id,
        extracted_data: extractedData
      })
    }

    // Retourner les résultats
    if (results.length === 1) {
      return NextResponse.json(results[0])
    } else {
      return NextResponse.json({
        success: true,
        results,
        processed: results.length
      })
    }

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
  const expenseKeywords = [
    'dépense', 'ticket', 'facture', 'reçu', 'addition', 'note',
    'restaurant', 'taxi', 'hotel', 'carburant', 'course', 'essence',
    '€', 'euro', 'eur', 'total', 'prix', 'montant', 'payer', 'payé',
    'uber', 'sncf', 'metro', 'bus', 'parking', 'péage',
    'café', 'bar', 'bistrot', 'mcdo', 'pizza', 'food',
    'pharmacie', 'médecin', 'docteur', 'consultation'
  ]
  
  const textToCheck = (message.text || message.media?.caption || '').toLowerCase()
  
  // Présence d'image = probable dépense
  if (message.media?.type === 'image') {
    console.log('✅ Dépense détectée: présence d\'image')
    return true
  }
  
  // Si on a du texte, vérifier les mots-clés
  if (textToCheck.trim().length > 0) {
    for (const keyword of expenseKeywords) {
      if (textToCheck.includes(keyword.toLowerCase())) {
        console.log(`✅ Dépense détectée: mot-clé "${keyword}" trouvé`)
        return true
      }
    }
    
    // Pattern de prix dans le texte
    const pricePatterns = [
      /\d+[,\.]\d{2}\s*€/,
      /€\s*\d+[,\.]\d{2}/,
      /\d+[,\.]\d{2}\s*eur/i,
      /total[:\s]*\d+/i,
      /\d+\s*euros?/i,
      /montant[:\s]*\d+/i
    ]
    
    for (const pattern of pricePatterns) {
      if (pattern.test(textToCheck)) {
        console.log(`✅ Dépense détectée: pattern de prix trouvé`)
        return true
      }
    }
  }
  
  console.log('❌ Message non détecté comme dépense')
  return false
}
