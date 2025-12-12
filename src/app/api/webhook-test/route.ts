import { NextRequest, NextResponse } from 'next/server'
import { saveExpenseToSupabase, saveImageToSupabase, type WhatsAppExpense } from '@/lib/supabase'

/**
 * Endpoint simple pour test webhook Meta
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  console.log('🔍 Test webhook reçu:', { mode, token, challenge })
  
  if (mode === 'subscribe') {
    // Accepter n'importe quel token pour le test
    if (token) {
      console.log('✅ Token accepté:', token)
      return new Response(challenge || 'OK', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }
  }
  
  return new Response('Test endpoint OK', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export async function POST(req: NextRequest) {
  console.log('📱 POST webhook test reçu')
  
  try {
    const body = await req.json()
    console.log('📋 Données WhatsApp reçues:', JSON.stringify(body, null, 2))
    
    // Traiter comme un vrai message WhatsApp
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (value?.messages) {
      console.log('📨 Messages WhatsApp détectés!')
      
      // Importer et utiliser la logique de traitement principal
      const { processExpenseContent } = await import('@/lib/ai-processor-unified')
      
      // Fonction de téléchargement WhatsApp Media
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
      
      for (const message of value.messages) {
        console.log('💬 Traitement message:', {
          from: message.from,
          type: message.type,
          timestamp: message.timestamp,
          hasText: !!message.text,
          hasImage: !!message.image
        })
        
        let messageText = ''
        let imageBase64 = undefined
        
        // Traitement des images avec caption
        if (message.type === 'image' && message.image) {
          console.log('📸 Image WhatsApp reçue:', {
            id: message.image.id,
            caption: message.image.caption
          })
          
          // Utiliser le caption s'il existe
          if (message.image.caption) {
            messageText = message.image.caption
            console.log('📝 Caption détecté:', messageText)
          } else {
            messageText = 'Ticket de dépense'
            console.log('📷 Image sans caption, traitement comme ticket potentiel')
          }
          
          // Télécharger et analyser l'image avec OCR
          try {
            console.log('🔍 Tentative de téléchargement image Meta...')
            imageBase64 = await downloadWhatsAppMedia(message.image.id)
            console.log('✅ Image téléchargée avec succès pour analyse OCR')
            
            // Si pas de caption mais image téléchargée, utiliser un message générique pour l'IA
            if (!message.image.caption) {
              messageText = 'Analyser ce ticket de dépense'
            }
          } catch (error) {
            console.error('⚠️ Erreur téléchargement image:', error)
            console.log('📝 Fallback: traitement sans image')
          }
        } else if (message.text) {
          messageText = message.text.body || ''
        }
        
        // Détecter si c'est un message de dépense
        const textToCheck = messageText.toLowerCase()
        const isExpenseMessage = textToCheck.includes('€') || 
                               textToCheck.includes('restaurant') || 
                               textToCheck.includes('taxi') || 
                               textToCheck.includes('dépense') ||
                               message.type === 'image' || // Toutes les images sont potentiellement des dépenses
                               /\d+/.test(textToCheck)
        
        if (!isExpenseMessage) {
          console.log('⚠️ Message ignoré (pas de dépense détectée)')
          continue
        }
        
        console.log('💰 Message de dépense détecté, traitement avec IA...')
        
        // Traitement complet avec IA
        let imageForAI = undefined
        if (imageBase64) {
          // Formater l'image correctement pour l'IA (avec préfixe data:image)
          imageForAI = `data:image/jpeg;base64,${imageBase64}`
          console.log('🖼️ Image formatée pour IA, taille:', Math.round(imageBase64.length / 1024), 'KB')
        }
        
        const expenseData = await processExpenseContent(
          imageForAI, // Image formatée pour IA
          messageText || 'Message WhatsApp reçu'
        )
        
        console.log('✅ IA - Données extraites:', expenseData)
        
        // Créer l'enregistrement pour Supabase avec métadonnées complètes
        let receivedDate = new Date()
        if (message.timestamp) {
          try {
            // Essayer différents formats de timestamp
            const ts = parseInt(message.timestamp.toString())
            if (ts > 1000000000000) {
              // Timestamp en millisecondes
              receivedDate = new Date(ts)
            } else if (ts > 1000000000) {
              // Timestamp en secondes
              receivedDate = new Date(ts * 1000)
            }
          } catch (error) {
            console.log('⚠️ Erreur parsing timestamp, utilisation date actuelle')
          }
        }
        
        console.log('📋 Métadonnées message:', {
          from: message.from,
          timestamp: message.timestamp,
          receivedAt: receivedDate.toISOString(),
          messageType: message.type,
          isValidDate: !isNaN(receivedDate.getTime())
        })
        
        const expenseRecord: WhatsAppExpense = {
          expense_id: `${Date.now()}_${message.from || 'unknown'}`,
          amount: parseFloat(expenseData.amount?.toString() || '0') || 0,
          merchant: expenseData.merchant || (messageText.includes('€') ? 
            messageText.split('€')[0].trim().substring(0, 50) : 'Marchand à identifier'),
          description: expenseData.description || messageText || 'Message WhatsApp',
          category: expenseData.category || (messageText.toLowerCase().includes('restaurant') ? 'Restauration' : 
                   messageText.toLowerCase().includes('taxi') ? 'Transport' : 'Divers'),
          confidence: Math.min((expenseData.confidence || 0.5), 1), // Limiter à 100%
          raw_text: messageText || '',
          whatsapp_from: message.from || 'Numéro inconnu',
          source: `whatsapp_${message.type || 'text'}`,
          received_at: receivedDate.toISOString(),
          processed_at: new Date().toISOString()
        }
        
        console.log('💾 Enregistrement à sauver:', expenseRecord)
        
        // Sauvegarder l'image directement en base64 (plus simple et immédiat)
        if (imageBase64 && message.type === 'image') {
          console.log('📸 Sauvegarde image en base64...')
          try {
            // Stocker directement en base64 avec préfixe data:image
            const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`
            expenseRecord.image_data = imageDataUrl
            console.log('✅ Image sauvée en base64, taille:', Math.round(imageBase64.length / 1024), 'KB')
            
            // Optionnel: aussi essayer le Storage si disponible
            try {
              const imageUrl = await saveImageToSupabase(imageBase64, expenseRecord.expense_id)
              if (imageUrl) {
                expenseRecord.image_url = imageUrl
                console.log('✅ Image aussi sauvée dans Storage:', imageUrl)
              }
            } catch (storageError) {
              console.log('⚠️ Storage non disponible, base64 utilisé:', storageError instanceof Error ? storageError.message : 'Erreur inconnue')
            }
          } catch (imageError) {
            console.error('❌ Erreur sauvegarde image:', imageError)
          }
        }
        
        // Sauvegarder dans Supabase (priorité) + fichier (fallback)
        try {
          // Sauvegarder dans Supabase
          const savedExpense = await saveExpenseToSupabase(expenseRecord)
          console.log('✅ Dépense sauvée en BDD Supabase:', savedExpense)
        } catch (error) {
          console.error('⚠️ Échec Supabase, fallback fichier:', error)
          
          // Fallback: sauvegarder dans fichier temporaire
          try {
            const fs = await import('fs/promises')
            const path = '/tmp/whatsapp-expenses.json'
            
            let expenses = []
            try {
              const data = await fs.readFile(path, 'utf-8')
              expenses = JSON.parse(data)
            } catch {
              // Fichier n'existe pas encore
            }
            
            expenses.push(expenseRecord)
            await fs.writeFile(path, JSON.stringify(expenses, null, 2))
            
            console.log('💾 Dépense sauvée en fichier (fallback):', expenseRecord)
          } catch (fileError) {
            console.error('❌ Erreur sauvegarde fichier:', fileError)
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp message processed',
      received: body
    })
  } catch (error) {
    console.error('❌ Erreur traitement:', error)
    return NextResponse.json({
      success: true,
      message: 'Webhook reçu avec erreur',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}