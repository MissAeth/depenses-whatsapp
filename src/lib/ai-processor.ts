/**
 * Module IA pour l'extraction automatique des données de dépenses
 * Utilise Tesseract OCR + patterns regex + IA locale (optionnel)
 */

// Types pour les données extraites
export interface ExtractedExpenseData {
  amount: number
  date: string
  merchant: string
  description: string
  category: string
  confidence: number
  rawText: string
}

// Catégories et mots-clés pour la classification
const CATEGORY_KEYWORDS = {
  'Transport': ['taxi', 'uber', 'sncf', 'metro', 'bus', 'essence', 'carburant', 'parking', 'péage', 'autoroute', 'vtc', 'blablacar'],
  'Restauration': ['restaurant', 'café', 'bar', 'boulangerie', 'mcdo', 'pizza', 'food', 'resto', 'déjeuner', 'diner', 'bistrot'],
  'Hébergement': ['hotel', 'airbnb', 'booking', 'hébergement', 'nuit', 'chambre', 'gîte', 'auberge'],
  'Fournitures': ['fourniture', 'papier', 'stylo', 'bureau', 'matériel', 'équipement', 'amazon', 'fnac', 'bureau vallée'],
  'Abonnements': ['abonnement', 'subscription', 'netflix', 'spotify', 'internet', 'mobile', 'téléphone', 'forfait'],
  'Santé': ['pharmacie', 'médecin', 'dentiste', 'docteur', 'clinique', 'hôpital', 'consultation'],
  'Loisirs': ['cinéma', 'théâtre', 'concert', 'sport', 'livre', 'musée', 'parc', 'loisir'],
  'Divers': ['divers', 'autre', 'course', 'supermarché', 'magasin']
}

/**
 * Extrait le montant d'un texte avec différents patterns (amélioré pour tickets français)
 */
function extractAmount(text: string): number {
  console.log('💰 Extraction du montant depuis:', text.substring(0, 200))
  
  // Patterns améliorés pour tickets français
  const patterns = [
    // Patterns avec "TOTAL" (priorité haute)
    /TOTAL[:\s]*(\d+[,\.]\d{2})\s*€?/i,           // TOTAL: 15.50€
    /TOTAL[:\s]*(\d+)\s*[,\.]\s*(\d{2})\s*€?/i,   // TOTAL: 15,50€ (avec espace)
    /TOTAL[:\s]*(\d+)\s*€?/i,                      // TOTAL: 15€ (sans centimes)
    
    // Patterns avec "€" ou "EUR"
    /(\d+[,\.]\d{2})\s*(?:€|EUR|EUROS?)/gi,        // 15.50€ ou 15,50€
    /(?:€|EUR|EUROS?)\s*(\d+[,\.]\d{2})/gi,         // €15.50 ou €15,50
    /(\d+)\s*[,\.]\s*(\d{2})\s*(?:€|EUR)/gi,       // 15 , 50€ (avec espaces)
    
    // Montants en fin de ligne (souvent le total)
    /(\d+[,\.]\d{2})\s*$/gm,                        // 15.50 en fin de ligne
    /(\d+)\s*[,\.]\s*(\d{2})\s*$/gm,               // 15 , 50 en fin de ligne
    
    // Patterns généraux (dernier recours)
    /\b(\d{1,3}(?:\s*\d{3})*[,\.]\d{2})\b/g,       // 1 234,56 (format français avec espaces)
    /\b(\d{1,4}[,\.]\d{2})\b/g,                    // Format général
  ]

  const amounts: number[] = []
  
  for (const pattern of patterns) {
    // S'assurer que le pattern a le flag 'g' pour matchAll
    let globalPattern: RegExp
    if (pattern.global) {
      globalPattern = pattern
    } else {
      // Ajouter le flag 'g' si absent, en préservant les autres flags
      const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
      globalPattern = new RegExp(pattern.source, flags)
    }
    
    try {
      const matches = Array.from(text.matchAll(globalPattern))
      if (matches && matches.length > 0) {
        for (const match of matches) {
          let amountStr = ''
          
          // Gérer les groupes de capture multiples (pour formats avec espaces)
          if (match[2]) {
            // Format: 15 , 50
            amountStr = `${match[1]}.${match[2]}`
          } else if (match[1]) {
            // Format standard: 15.50 ou 15,50
            amountStr = match[1].replace(/\s+/g, '').replace(',', '.')
          }
          
          if (amountStr) {
            const amount = parseFloat(amountStr)
            // Filtrer les montants raisonnables (entre 0.01€ et 10000€)
            if (!isNaN(amount) && amount > 0.01 && amount < 10000) {
              amounts.push(amount)
              console.log(`  ✓ Montant trouvé: ${amount}€`)
            }
          }
        }
      }
    } catch (error) {
      // Si matchAll échoue, utiliser match à la place (fallback)
      console.warn('⚠️ matchAll a échoué, utilisation de match:', error)
      const matches = text.match(globalPattern)
      if (matches) {
        for (const match of Array.isArray(matches) ? matches : [matches]) {
          if (typeof match === 'string') {
            const amountMatch = match.match(/(\d+[,\.]\d{2})/) || match.match(/(\d+)\s*[,\.]\s*(\d{2})/)
            if (amountMatch) {
              const amountStr = amountMatch[2] 
                ? `${amountMatch[1]}.${amountMatch[2]}` 
                : amountMatch[1].replace(',', '.')
              const amount = parseFloat(amountStr)
              if (!isNaN(amount) && amount > 0.01 && amount < 10000) {
                amounts.push(amount)
                console.log(`  ✓ Montant trouvé (fallback): ${amount}€`)
              }
            }
          }
        }
      }
    }
  }

  // Retourner le montant le plus élevé (souvent le total)
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  console.log(`💰 Montant final extrait: ${maxAmount}€ (parmi ${amounts.length} montants trouvés)`)
  return maxAmount
}

/**
 * Extrait la date d'un texte
 */
function extractDate(text: string): string {
  const datePatterns = [
    /(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{4})/g,        // 15/03/2024
    /(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2})/g,        // 15/03/24
    /(\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2})/g,        // 2024/03/15
  ]

  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const match of matches) {
        try {
          // Normaliser le format de date
          const dateParts = match.split(/[/\-\.]/)
          
          if (dateParts.length === 3) {
            let [part1, part2, part3] = dateParts
            
            // Gérer l'année à 2 chiffres
            if (part3.length === 2) {
              part3 = '20' + part3
            }
            
            let year, month, day
            
            if (part1.length === 4) {
              // Format YYYY/MM/DD
              [year, month, day] = [part1, part2, part3]
            } else {
              // Format DD/MM/YYYY
              [day, month, year] = [part1, part2, part3]
            }
            
            // Valider et formater
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

  // Si aucune date trouvée, retourner la date actuelle
  return new Date().toISOString().split('T')[0]
}

/**
 * Extrait le nom du marchand/fournisseur (amélioré pour restaurants français)
 */
function extractMerchant(text: string): string {
  console.log('🏪 Extraction du nom du marchand depuis:', text.substring(0, 300))
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Mots-clés à ignorer (ne sont pas des noms de commerces)
  const skipKeywords = [
    'ticket', 'facture', 'reçu', 'total', 'tva', 'cb', 'carte', 'bancaire',
    'merci', 'visite', 'client', 'date', 'heure', 'table', 'serveur',
    'addition', 'sans contact', 'chip', 'pin', 'approuve', 'approuvé',
    'terminal', 'transaction', 'numero', 'n°', 'ref', 'reference'
  ]
  
  // Patterns à ignorer
  const skipPatterns = [
    /^\d+[,\.]\d{2}\s*€?$/,           // Ligne avec juste un prix
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,  // Ligne avec juste une date
    /^\d{1,2}[hH:]\d{2}$/,            // Ligne avec juste une heure
    /^TOTAL/i,                         // Ligne commençant par TOTAL
    /^TVA/i,                           // Ligne commençant par TVA
    /^CB\s|^CARTE/i,                   // Ligne commençant par CB ou CARTE
  ]
  
  // Chercher dans les premières lignes (souvent le nom du commerce)
  // On regarde les 8 premières lignes pour être plus flexible
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i]
    
    // Ignorer les lignes vides ou trop courtes
    if (line.length < 3 || line.length > 60) {
      continue
    }
    
    // Vérifier les patterns à ignorer
    let shouldSkip = false
    for (const pattern of skipPatterns) {
      if (pattern.test(line)) {
        shouldSkip = true
        break
      }
    }
    
    if (shouldSkip) continue
    
    // Vérifier les mots-clés à ignorer
    const lineLower = line.toLowerCase()
    for (const keyword of skipKeywords) {
      if (lineLower.includes(keyword)) {
        shouldSkip = true
        break
      }
    }
    
    if (shouldSkip) continue
    
    // Vérifier si la ligne contient principalement du texte (pas trop de chiffres)
    const digitCount = (line.match(/\d/g) || []).length
    const digitRatio = digitCount / line.length
    
    // Si plus de 30% de chiffres, probablement pas un nom de commerce
    if (digitRatio > 0.3) {
      continue
    }
    
    // Nettoyer le nom du marchand
    let merchant = line
      .replace(/[^\w\s\-\'àáâãäåèéêëìíîïòóôõöùúûüýÿç]/gi, ' ') // Garder lettres, espaces, tirets, apostrophes
      .replace(/\s+/g, ' ')  // Remplacer espaces multiples par un seul
      .trim()
    
    // Vérifier que le nom nettoyé est valide
    if (merchant && merchant.length >= 3 && merchant.length <= 50) {
      // Capitaliser correctement (première lettre de chaque mot en majuscule)
      merchant = merchant.split(' ')
        .map(word => {
          if (word.length === 0) return ''
          // Gérer les mots avec apostrophes (ex: "L'Atelier")
          if (word.includes("'")) {
            return word.split("'")
              .map((part, idx) => 
                idx === 0 
                  ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                  : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              )
              .join("'")
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')
      
      console.log(`  ✓ Nom du marchand trouvé: "${merchant}" (ligne ${i + 1})`)
      return merchant
    }
  }
  
  console.log('  ⚠ Aucun nom de marchand trouvé')
  return "Marchand inconnu"
}

/**
 * Extrait une description de la dépense
 */
function extractDescription(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const descriptions: string[] = []
  
  for (const line of lines) {
    // Chercher des lignes qui pourraient être des descriptions de produits/services
    if (line.length > 5 && line.length < 100 &&
        !(/^\d+[,\.]?\d*\s*€?$/.test(line)) &&  // Pas juste un prix
        !(/^\d{2}[/\-\.]\d{2}/.test(line)) &&   // Pas juste une date
        !(/^(total|tva|carte|cb)/i.test(line))) {  // Pas des mots-clés système
      
      descriptions.push(line)
    }
  }
  
  if (descriptions.length > 0) {
    // Joindre les descriptions ou prendre la plus longue
    return descriptions.slice(0, 3).join(' | ')  // Max 3 descriptions
  }
  
  return "Description automatique"
}

/**
 * Catégorise une dépense basée sur le marchand et la description
 */
function categorizeExpense(merchant: string, description: string): string {
  const textToAnalyze = `${merchant} ${description}`.toLowerCase()
  
  // Score par catégorie
  const categoryScores: Record<string, number> = {}
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    categoryScores[category] = 0
    
    for (const keyword of keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        categoryScores[category] += 1
      }
    }
  }
  
  // Retourner la catégorie avec le meilleur score
  const bestCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)[0]
  
  return bestCategory[1] > 0 ? bestCategory[0] : 'Divers'
}

/**
 * Calcule un score de confiance pour l'extraction
 */
function calculateConfidence(data: Partial<ExtractedExpenseData>): number {
  let score = 0
  
  // Points pour chaque champ extrait avec succès
  if (data.amount && data.amount > 0) score += 0.3
  if (data.merchant && data.merchant !== "Marchand inconnu") score += 0.3
  if (data.description && data.description !== "Description automatique") score += 0.2
  if (data.date && data.date !== new Date().toISOString().split('T')[0]) score += 0.1
  if (data.category && data.category !== 'Divers') score += 0.1
  
  return Math.min(score, 1.0)
}

/**
 * Fonction OCR réelle utilisant Tesseract.js
 * Lit vraiment le texte des images de tickets de caisse
 */
async function performOCR(imageBase64: string): Promise<string> {
  // Vérifier que nous sommes côté client
  if (typeof window === 'undefined') {
    throw new Error('OCR doit être exécuté côté client (navigateur)')
  }

  try {
    console.log('🔍 Démarrage OCR réel avec Tesseract.js...')
    
    // Importer Tesseract dynamiquement (client-side seulement)
    const Tesseract = await import('tesseract.js')
    const { createWorker } = Tesseract
    
    // Créer un worker Tesseract avec langues français et anglais
    console.log('⚙️ Initialisation du worker Tesseract...')
    const worker = await createWorker('fra+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100)
          console.log(`📖 OCR en cours: ${progress}%`)
        } else if (m.status === 'loading tesseract core') {
          console.log('📦 Chargement du core Tesseract...')
        } else if (m.status === 'initializing tesseract') {
          console.log('🔧 Initialisation de Tesseract...')
        } else if (m.status === 'loading language traineddata') {
          console.log('🌐 Chargement des données linguistiques...')
        }
      }
    })
    
    // Convertir base64 en blob pour Tesseract
    console.log('🖼️ Conversion de l\'image...')
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })
    
    // Effectuer la reconnaissance OCR
    console.log('📸 Analyse OCR de l\'image en cours...')
    const { data: { text } } = await worker.recognize(blob)
    
    // Nettoyer le texte extrait
    const cleanedText = text.trim()
    
    console.log('✅ OCR terminé!')
    console.log('📝 Texte extrait (premiers 300 caractères):', cleanedText.substring(0, 300))
    console.log('📊 Longueur totale:', cleanedText.length, 'caractères')
    
    // Terminer le worker pour libérer les ressources
    await worker.terminate()
    
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('Texte OCR trop court ou vide. L\'image est peut-être floue, mal éclairée, ou ne contient pas de texte lisible.')
    }
    
    return cleanedText
  } catch (error) {
    console.error('❌ Erreur OCR détaillée:', error)
    
    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur lors de la lecture OCR'
    
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erreur de connexion lors du téléchargement des modèles OCR. Vérifiez votre connexion internet.'
      } else if (error.message.includes('worker')) {
        errorMessage = 'Erreur lors de l\'initialisation de l\'OCR. Réessayez dans quelques instants.'
      } else {
        errorMessage = error.message
      }
    }
    
    throw new Error(
      `${errorMessage}. ` +
      `Assurez-vous que l'image est claire, bien éclairée et contient du texte lisible. ` +
      `Si le problème persiste, vérifiez votre connexion internet.`
    )
  }
}

/**
 * Fonction principale pour traiter le contenu d'une dépense
 * Essaie d'abord l'IA Vision si disponible, sinon utilise l'OCR
 */
export async function processExpenseContent(
  imageBase64?: string, 
  textContent?: string
): Promise<ExtractedExpenseData> {
  
  // Si on a une image et qu'on est côté serveur, essayer l'IA Vision d'abord
  if (imageBase64 && typeof window === 'undefined') {
    try {
      const { extractWithAIVision } = await import('./ai-vision')
      const aiResult = await extractWithAIVision(imageBase64)
      
      if (aiResult) {
        console.log('✅ Données extraites par IA Vision:', aiResult)
        return aiResult
      }
    } catch (error) {
      console.warn('⚠️ Erreur avec IA Vision, fallback sur OCR:', error)
      // Continue avec OCR
    }
  }
  
  let rawText = ''
  
  if (textContent) {
    rawText = textContent
  } else if (imageBase64) {
    // Utilisation de l'OCR réel avec Tesseract.js (côté client uniquement)
    if (typeof window === 'undefined') {
      throw new Error('OCR doit être exécuté côté client. Utilisez l\'API /api/process-image pour l\'IA Vision côté serveur.')
    }
    
    console.log('🔍 Début OCR réel de l\'image...')
    try {
      rawText = await performOCR(imageBase64)
      console.log('📝 Texte OCR extrait (premiers 500 caractères):', rawText.substring(0, 500))
      
      if (!rawText || rawText.trim().length < 10) {
        throw new Error('Le texte extrait est trop court. L\'image est peut-être floue ou ne contient pas de texte lisible.')
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'OCR:', error)
      throw new Error(
        `Impossible de lire le texte du ticket. ${error instanceof Error ? error.message : 'Vérifiez que l\'image est claire et contient du texte lisible.'}`
      )
    }
  } else {
    throw new Error("Aucun contenu fourni (image ou texte)")
  }
  
  if (!rawText.trim()) {
    throw new Error("Aucun texte extrait du contenu")
  }
  
  // Afficher le texte brut pour débogage
  console.log('📄 Texte brut complet extrait par OCR:')
  console.log('─'.repeat(60))
  console.log(rawText)
  console.log('─'.repeat(60))
  
  // Extraire les informations
  console.log('🔍 Début de l\'extraction des données...')
  const amount = extractAmount(rawText)
  const date = extractDate(rawText)
  const merchant = extractMerchant(rawText)
  const description = extractDescription(rawText)
  const category = categorizeExpense(merchant, description)
  
  // Afficher les résultats de l'extraction
  console.log('📊 Résultats de l\'extraction:')
  console.log(`  • Montant: ${amount}€`)
  console.log(`  • Date: ${date}`)
  console.log(`  • Marchand: ${merchant}`)
  console.log(`  • Description: ${description}`)
  console.log(`  • Catégorie: ${category}`)
  
  // Préparer les données
  const extractedData: Partial<ExtractedExpenseData> = {
    amount,
    date,
    merchant,
    description,
    category,
    rawText
  }
  
  // Calculer le score de confiance
  const confidence = calculateConfidence(extractedData)
  console.log(`  • Confiance: ${Math.round(confidence * 100)}%`)
  
  return {
    ...extractedData,
    confidence
  } as ExtractedExpenseData
}

/**
 * Fonction de test pour le développement
 */
export async function testAIProcessor(): Promise<ExtractedExpenseData> {
  const testText = `
    RESTAURANT LE PETIT BISTROT
    
    Table 5 - Serveur: Marie
    
    1x Menu du jour         15.50€
    1x Café                  2.50€
    1x Dessert               5.00€
    
    TOTAL                   23.00€
    
    CB SANS CONTACT
    15/03/2024 - 12:45
    
    Merci de votre visite
  `
  
  return await processExpenseContent(undefined, testText)
}