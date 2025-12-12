/**
 * Module IA Unifié - Fusion des capacités Gemini + OCR Cloud
 * Priorité : Gemini Vision > OpenAI Vision > OCR Tesseract
 */

// Import des fonctions IA existantes
import { extractWithAIVision } from './ai-vision'

// Types pour les données extraites (compatible avec toutes les versions)
export interface ExtractedExpenseData {
  amount: number
  date: string
  merchant: string
  description: string
  category: string
  confidence: number
  rawText: string
}

// Fonction pour vérifier quelle IA est disponible
export async function getAvailableAIProvider(): Promise<'gemini' | 'openai' | 'ocr' | 'none'> {
  console.log('🔍 Vérification des APIs IA disponibles...')
  
  // Vérifier Gemini (priorité 1)
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ Gemini API configurée')
    return 'gemini'
  }
  
  // Vérifier OpenAI (priorité 2)
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API configurée')
    return 'openai'
  }
  
  // Fallback OCR (priorité 3)
  if (typeof window !== 'undefined') {
    console.log('⚠️ Aucune IA configurée, utilisation OCR Tesseract')
    return 'ocr'
  }
  
  console.log('❌ Aucune IA disponible')
  return 'none'
}

// Fonction principale unifiée pour traiter une image
export async function processExpenseContent(
  imageBase64?: string, 
  textContent?: string
): Promise<ExtractedExpenseData> {
  
  console.log('🤖 Démarrage du traitement unifié IA...')
  
  // Si on a du texte fourni directement, l'analyser avec des patterns
  if (textContent) {
    console.log('📝 Analyse du texte fourni directement')
    return analyzeTextWithPatterns(textContent)
  }
  
  // Si on a une image, choisir la meilleure méthode d'analyse
  if (imageBase64) {
    // Côté client : utiliser l'API serveur si IA configurée
    if (typeof window !== 'undefined') {
      console.log('🌐 Côté client détecté, utilisation API serveur')
      return await processWithServerAPI(imageBase64)
    }
    
    // Côté serveur : utiliser directement l'IA
    const aiProvider = await getAvailableAIProvider()
    
    switch (aiProvider) {
      case 'gemini':
      case 'openai':
        // Utiliser l'IA Vision (Gemini ou OpenAI)
        try {
          console.log(`🧠 Utilisation de l'IA Vision (${aiProvider})...`)
          const aiResult = await extractWithAIVision(imageBase64)
          
          if (aiResult && aiResult.amount > 0) {
            console.log('✅ Données extraites par IA Vision avec succès')
            return aiResult
          } else {
            console.log('⚠️ IA Vision n\'a pas trouvé de données valides, fallback patterns')
            return analyzeTextWithPatterns('Aucun texte extrait - IA Vision a échoué')
          }
        } catch (error) {
          console.warn('❌ Erreur IA Vision, fallback vers patterns:', error)
          return analyzeTextWithPatterns(`Erreur IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
        }
      
      case 'ocr':
      case 'none':
        // Fallback patterns basic
        console.log('⚠️ Aucune IA configurée côté serveur')
        return analyzeTextWithPatterns('Aucune IA configurée - utilisation de données par défaut')
      
      default:
        throw new Error('Aucune méthode d\'analyse disponible')
    }
  }
  
  throw new Error("Aucun contenu fourni (image ou texte)")
}

// Traitement avec OCR Tesseract (côté client)
async function processWithOCR(imageBase64: string): Promise<ExtractedExpenseData> {
  try {
    console.log('🔍 Démarrage OCR Tesseract...')
    
    // Importer Tesseract dynamiquement (client-side seulement)
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker(['fra', 'eng'])
    
    // Convertir base64 en blob
    const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '')
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })
    
    // Reconnaissance OCR
    const { data: { text } } = await worker.recognize(blob)
    await worker.terminate()
    
    console.log('✅ OCR terminé, analyse du texte...')
    return analyzeTextWithPatterns(text)
    
  } catch (error) {
    console.error('❌ Erreur OCR:', error)
    throw new Error(`Erreur OCR: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

// Traitement avec API serveur (pour production sans IA configurée)
async function processWithServerAPI(imageBase64: string): Promise<ExtractedExpenseData> {
  try {
    console.log('🌐 Appel API serveur pour traitement...')
    
    const response = await fetch('/api/process-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 })
    })
    
    if (!response.ok) {
      let errorMessage = 'Erreur API serveur'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {}
      console.warn('⚠️ API serveur non OK, fallback OCR. Raison:', errorMessage)
      return await processWithOCR(imageBase64)
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      return result.data
    } else {
      console.warn('⚠️ Réponse API invalide, fallback OCR. Détails:', result)
      return await processWithOCR(imageBase64)
    }
    
  } catch (error) {
    console.error('❌ Erreur API serveur, fallback OCR:', error)
    return await processWithOCR(imageBase64)
  }
}

// Analyse de texte avec patterns avancés (fallback intelligent)
async function analyzeTextWithPatterns(text: string): Promise<ExtractedExpenseData> {
  console.log('🔍 Analyse du texte avec patterns avancés...')
  console.log('📝 Texte à analyser (premiers 200 chars):', text.substring(0, 200))
  
  const amount = extractAmount(text)
  const date = extractDate(text)
  const merchant = extractMerchant(text)
  const description = extractDescription(text)
  const category = categorizeExpense(merchant, description)
  const confidence = calculateConfidence({ amount, merchant, description, date, category })
  
  const result: ExtractedExpenseData = {
    amount,
    date,
    merchant,
    description,
    category,
    confidence,
    rawText: text
  }
  
  console.log('✅ Analyse terminée:', {
    amount: result.amount,
    merchant: result.merchant,
    category: result.category,
    confidence: Math.round(result.confidence * 100) + '%'
  })
  
  return result
}

// Extraction du montant avec patterns français améliorés
function extractAmount(text: string): number {
  console.log('💰 Extraction du montant...')
  console.log('📝 Texte pour extraction:', text.substring(0, 100))
  
  const patterns = [
    // Patterns spécifiques pour WhatsApp (priorité haute)
    /(\d+)\s*€/gi,
    /€\s*(\d+)/gi,
    
    // Patterns avec "TOTAL" (priorité haute)
    /TOTAL[:\s]*(\d+[,\.]\d{2})\s*€?/gi,
    /TOTAL[:\s]*(\d+)\s*[,\.]\s*(\d{2})\s*€?/gi,
    
    // Patterns avec "€" ou "EUR"
    /(\d+[,\.]\d{2})\s*(?:€|EUR|EUROS?)/gi,
    /(?:€|EUR|EUROS?)\s*(\d+[,\.]\d{2})/gi,
    
    // Montants simples avec €
    /(\d+)\s*€/g,
    
    // Montants en fin de ligne
    /(\d+[,\.]\d{2})\s*$/gm,
    
    // Patterns généraux
    /\b(\d{1,4}[,\.]\d{2})\b/g,
  ]

  const amounts: number[] = []
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      let amountStr = ''
      
      if (match[2]) {
        // Format: 15 , 50
        amountStr = `${match[1]}.${match[2]}`
      } else if (match[1]) {
        // Format standard: 15.50 ou 15,50
        amountStr = match[1].replace(/\s+/g, '').replace(',', '.')
      }
      
      if (amountStr) {
        const amount = parseFloat(amountStr)
        if (!isNaN(amount) && amount > 0.01 && amount < 10000) {
          amounts.push(amount)
        }
      }
    }
  }

  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  console.log(`💰 Montant extrait: ${maxAmount}€`)
  return maxAmount
}

// Extraction de la date
function extractDate(text: string): string {
  const datePatterns = [
    /(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{4})/g,
    /(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2})/g,
    /(\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2})/g,
  ]

  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const match of matches) {
        try {
          const dateParts = match.split(/[/\-\.]/)
          
          if (dateParts.length === 3) {
            let [part1, part2, part3] = dateParts
            
            if (part3.length === 2) {
              part3 = '20' + part3
            }
            
            let year, month, day
            
            if (part1.length === 4) {
              [year, month, day] = [part1, part2, part3]
            } else {
              [day, month, year] = [part1, part2, part3]
            }
            
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0]
            }
          }
        } catch (error) {
          continue
        }
      }
    }
  }

  return new Date().toISOString().split('T')[0]
}

// Extraction du marchand améliorée
function extractMerchant(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const skipKeywords = [
    'ticket', 'facture', 'reçu', 'total', 'tva', 'cb', 'carte',
    'merci', 'visite', 'client', 'date', 'heure', 'table', 'serveur'
  ]
  
  const skipPatterns = [
    /^\d+[,\.]\d{2}\s*€?$/,
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
    /^\d{1,2}[hH:]\d{2}$/,
    /^TOTAL/i,
    /^TVA/i,
    /^CB\s|^CARTE/i,
  ]
  
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i]
    
    if (line.length < 3 || line.length > 60) continue
    
    let shouldSkip = false
    for (const pattern of skipPatterns) {
      if (pattern.test(line)) {
        shouldSkip = true
        break
      }
    }
    if (shouldSkip) continue
    
    const lineLower = line.toLowerCase()
    for (const keyword of skipKeywords) {
      if (lineLower.includes(keyword)) {
        shouldSkip = true
        break
      }
    }
    if (shouldSkip) continue
    
    const digitCount = (line.match(/\d/g) || []).length
    const digitRatio = digitCount / line.length
    if (digitRatio > 0.3) continue
    
    let merchant = line
      .replace(/[^\w\s\-\'àáâãäåèéêëìíîïòóôõöùúûüýÿç]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (merchant && merchant.length >= 3 && merchant.length <= 50) {
      merchant = merchant.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      return merchant
    }
  }
  
  return "Marchand inconnu"
}

// Extraction de la description
function extractDescription(text: string): string {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5 && line.length < 100)
    .filter(line => !(/^\d+[,\.]?\d*\s*€?$/.test(line)))
    .filter(line => !(/^\d{2}[/\-\.]\d{2}/.test(line)))
    .filter(line => !(/^(total|tva|carte|cb)/i.test(line)))
  
  return lines.length > 0 ? lines.slice(0, 2).join(' - ') : "Description automatique"
}

// Catégorisation intelligente
function categorizeExpense(merchant: string, description: string): string {
  const textToAnalyze = `${merchant} ${description}`.toLowerCase()
  
  const categories = {
    'Transport': ['taxi', 'uber', 'sncf', 'metro', 'bus', 'essence', 'carburant', 'parking'],
    'Restauration': ['restaurant', 'café', 'bar', 'boulangerie', 'mcdo', 'pizza', 'resto'],
    'Hébergement': ['hotel', 'airbnb', 'booking', 'hébergement', 'nuit', 'chambre'],
    'Fournitures': ['fourniture', 'papier', 'bureau', 'matériel', 'équipement'],
    'Santé': ['pharmacie', 'médecin', 'dentiste', 'docteur', 'clinique'],
    'Loisirs': ['cinéma', 'théâtre', 'concert', 'sport', 'livre', 'musée'],
    'Divers': ['divers', 'autre', 'course', 'supermarché']
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => textToAnalyze.includes(keyword))) {
      return category
    }
  }
  
  return 'Divers'
}

// Calcul de confiance
function calculateConfidence(data: Partial<ExtractedExpenseData>): number {
  let score = 0
  
  if (data.amount && data.amount > 0) score += 0.3
  if (data.merchant && data.merchant !== "Marchand inconnu") score += 0.3
  if (data.description && data.description !== "Description automatique") score += 0.2
  if (data.date && data.date !== new Date().toISOString().split('T')[0]) score += 0.1
  if (data.category && data.category !== 'Divers') score += 0.1
  
  return Math.min(score, 1.0)
}