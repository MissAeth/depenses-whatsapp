/**
 * Module d'IA Vision pour l'extraction intelligente des données de dépenses
 * Supporte OpenAI GPT-4 Vision et Google Gemini Vision
 */

import { ExtractedExpenseData } from './ai-processor'

// Types pour les différents providers
type AIProvider = 'openai' | 'gemini' | 'none'

interface AIConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
}

/**
 * Détecte et configure le provider d'IA disponible
 */
function getAIConfig(): AIConfig {
  // Vérifier OpenAI
  if (process.env.OPENAI_API_KEY) {
    console.log('🤖 Provider détecté: OpenAI')
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    }
  }

  // Vérifier Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    console.log('🤖 Provider détecté: Google Gemini')
    console.log('  - Clé API:', geminiKey.substring(0, 10) + '...')
    // Utiliser gemini-1.5-flash par défaut (gratuit et supporte les images)
    const defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    console.log('  - Modèle:', defaultModel)
    return {
      provider: 'gemini',
      apiKey: geminiKey,
      model: defaultModel
    }
  }

  console.log('⚠️ Aucun provider d\'IA configuré')
  return { provider: 'none' }
}

/**
 * Extrait les données avec OpenAI GPT-4 Vision
 */
async function extractWithOpenAI(
  imageBase64: string,
  apiKey: string,
  model: string
): Promise<ExtractedExpenseData> {
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction de données de tickets de caisse français. 
Analyse l'image du ticket et extrais les informations suivantes au format JSON :
{
  "amount": nombre (montant en euros, ex: 25.50),
  "merchant": "nom du restaurant/commerce",
  "date": "YYYY-MM-DD",
  "description": "description de la dépense",
  "category": "Restauration" | "Transport" | "Hébergement" | "Fournitures" | "Abonnements" | "Santé" | "Loisirs" | "Divers"
}

Si une information n'est pas trouvée, utilise null pour les champs optionnels et 0 pour amount.
La catégorie doit être déterminée intelligemment selon le type de commerce.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse ce ticket de caisse et extrais les informations en JSON.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  
  if (!content) {
    throw new Error('Aucune réponse de l\'IA')
  }

  const extracted = JSON.parse(content)
  
  return {
    amount: extracted.amount || 0,
    date: extracted.date || new Date().toISOString().split('T')[0],
    merchant: extracted.merchant || 'Marchand inconnu',
    description: extracted.description || 'Description automatique',
    category: extracted.category || 'Divers',
    confidence: 0.9, // Haute confiance pour l'IA
    rawText: `[Extrait par OpenAI ${model}] ${extracted.merchant || ''} - ${extracted.description || ''}`
  }
}

/**
 * Extrait les données avec Google Gemini Vision
 */
async function extractWithGemini(
  imageBase64: string,
  apiKey: string,
  model: string
): Promise<ExtractedExpenseData> {
  console.log('🚀 Appel API Gemini avec modèle:', model)
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
  
  // D'abord, obtenir la liste des modèles disponibles depuis l'API Google
  let availableModels: string[] = []
  const apiVersionsToCheck = ['v1beta', 'v1']
  
  for (const apiVersion of apiVersionsToCheck) {
    try {
      const listUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`
      const listResponse = await fetch(listUrl)
      if (listResponse.ok) {
        const listData = await listResponse.json()
        const modelNames = listData.models?.map((m: any) => m.name?.replace('models/', '') || m.name) || []
        availableModels = [...availableModels, ...modelNames]
        console.log(`✅ Modèles disponibles dans ${apiVersion}:`, modelNames.length)
        if (modelNames.length > 0) {
          console.log('   Exemples:', modelNames.slice(0, 5).join(', '))
        }
      }
    } catch (error) {
      console.log(`⚠️ Impossible de lister les modèles dans ${apiVersion}`)
    }
  }
  
  // Si on a trouvé des modèles, filtrer ceux qui supportent les images
  const imageModels = availableModels.filter(name => 
    name.includes('flash') || 
    name.includes('pro') || 
    name.includes('vision')
  )
  
  // Construire la liste des modèles à essayer
  const modelConfigs: Array<{ model: string; apiVersion: string }> = []
  
  // Si on a des modèles disponibles, les utiliser
  if (imageModels.length > 0) {
    for (const modelName of imageModels) {
      // Déterminer la version d'API basée sur le nom du modèle
      if (modelName.includes('1.5')) {
        modelConfigs.push({ model: modelName, apiVersion: 'v1beta' })
        modelConfigs.push({ model: modelName, apiVersion: 'v1' })
      } else {
        modelConfigs.push({ model: modelName, apiVersion: 'v1beta' })
      }
    }
  } else {
    // Fallback : essayer les modèles standards si la liste n'a pas fonctionné
    console.log('⚠️ Utilisation des modèles par défaut (liste non disponible)')
    modelConfigs.push(
      { model: 'gemini-1.5-flash', apiVersion: 'v1beta' },
      { model: 'gemini-1.5-flash', apiVersion: 'v1' },
      { model: 'gemini-1.5-pro', apiVersion: 'v1beta' },
      { model: 'gemini-pro-vision', apiVersion: 'v1beta' }
    )
  }

  // Commencer par le modèle demandé
  const requestedConfig = modelConfigs.find(c => c.model === model) || modelConfigs[0]
  const configsToTry = [requestedConfig, ...modelConfigs.filter(c => c !== requestedConfig)]

  let lastError: Error | null = null

  for (const config of configsToTry) {
    const { model: visionModel, apiVersion } = config
    console.log(`🔍 Test avec modèle: ${visionModel}, API: ${apiVersion}`)
    
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${visionModel}:generateContent?key=${apiKey}`
    console.log('📡 URL:', url.replace(apiKey, 'API_KEY_HIDDEN'))
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Tu es un expert en extraction de données de tickets de caisse français. 
Analyse l'image du ticket et extrais les informations suivantes au format JSON strict.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire, sans markdown, sans explications.

Format JSON requis:
{
  "amount": nombre (montant en euros, ex: 25.50),
  "merchant": "nom du restaurant/commerce",
  "date": "YYYY-MM-DD",
  "description": "description de la dépense",
  "category": "Restauration" | "Transport" | "Hébergement" | "Fournitures" | "Abonnements" | "Santé" | "Loisirs" | "Divers"
}

Si une information n'est pas trouvée, utilise null pour les champs optionnels et 0 pour amount.
La catégorie doit être déterminée intelligemment selon le type de commerce.

IMPORTANT: Réponds uniquement avec le JSON, rien d'autre.`
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500
      }
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log(`📥 Réponse reçue pour ${visionModel} (${apiVersion}), status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur avec ${visionModel} (${apiVersion}):`, errorText.substring(0, 200))
        
        // Si c'est une erreur 404 (modèle non trouvé), essayer le suivant
        if (response.status === 404) {
          lastError = new Error(`Model ${visionModel} not found in ${apiVersion}`)
          continue // Essayer le modèle suivant
        }
        
        // Si c'est une erreur 429 (quota dépassé), message plus clair
        if (response.status === 429) {
          try {
            const errorData = JSON.parse(errorText)
            const quotaMessage = errorData.error?.message || errorText
            if (quotaMessage.includes('quota') || quotaMessage.includes('Quota exceeded')) {
              lastError = new Error(`Quota API Gemini dépassé. Le plan gratuit a atteint sa limite. Veuillez attendre ou passer à un plan payant. Détails: ${quotaMessage.substring(0, 300)}`)
            } else {
              lastError = new Error(`Gemini API error: ${response.status} - ${errorText}`)
            }
          } catch {
            lastError = new Error(`Quota API Gemini dépassé (429). Veuillez attendre ou vérifier votre plan.`)
          }
          // Ne pas continuer avec d'autres modèles si c'est un problème de quota
          throw lastError
        }
        
        // Pour les autres erreurs, lancer l'erreur
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Données reçues (premiers 500 caractères):', JSON.stringify(data).substring(0, 500))
      
      // Vérifier s'il y a des erreurs dans la réponse
      if (data.error) {
        console.error('❌ Erreur dans la réponse Gemini:', data.error)
        lastError = new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`)
        continue // Essayer le modèle suivant
      }
      
      // Extraire le contenu de la réponse
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!content) {
        console.error('❌ Pas de contenu dans la réponse. Structure complète:', JSON.stringify(data, null, 2))
        lastError = new Error('Aucune réponse de l\'IA - structure de réponse inattendue')
        continue // Essayer le modèle suivant
      }

      console.log(`✅ Succès avec ${visionModel} (${apiVersion})`)
      console.log('📝 Contenu extrait (premiers 300 caractères):', content.substring(0, 300))

      // Nettoyer le JSON (enlever markdown si présent)
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let extracted
      try {
        extracted = JSON.parse(jsonContent)
        console.log('✅ JSON parsé avec succès:', extracted)
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON. Contenu brut:', jsonContent)
        throw new Error(`Erreur parsing JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
      }
      
      return {
        amount: extracted.amount || 0,
        date: extracted.date || new Date().toISOString().split('T')[0],
        merchant: extracted.merchant || 'Marchand inconnu',
        description: extracted.description || 'Description automatique',
        category: extracted.category || 'Divers',
        confidence: 0.9, // Haute confiance pour l'IA
        rawText: `[Extrait par Gemini ${visionModel}] ${extracted.merchant || ''} - ${extracted.description || ''}`
      }
    } catch (error: any) {
      console.error(`❌ Erreur avec ${visionModel} (${apiVersion}):`, error.message)
      lastError = error
      // Continuer avec le modèle suivant
      continue
    }
  }

  // Si on arrive ici, aucun modèle n'a fonctionné
  throw new Error(`Aucun modèle Gemini disponible. Dernière erreur: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Fonction principale pour extraire les données avec une IA Vision
 * Cette fonction est appelée côté serveur uniquement
 */
export async function extractWithAIVision(
  imageBase64: string
): Promise<ExtractedExpenseData> {
  // Vérifier que nous sommes côté serveur
  if (typeof window !== 'undefined') {
    throw new Error('extractWithAIVision doit être appelé côté serveur')
  }

  const config = getAIConfig()

  if (config.provider === 'none') {
    throw new Error('Aucune clé API d\'IA configurée. Veuillez configurer GEMINI_API_KEY ou OPENAI_API_KEY')
  }

  if (!config.apiKey) {
    throw new Error(`Clé API manquante pour ${config.provider}`)
  }

  console.log(`🤖 Utilisation de ${config.provider} pour l'extraction...`)

  if (config.provider === 'openai' && config.apiKey) {
    return await extractWithOpenAI(imageBase64, config.apiKey, config.model || 'gpt-4o-mini')
  }

  if (config.provider === 'gemini' && config.apiKey) {
    console.log('🔵 Appel extractWithGemini...')
    const result = await extractWithGemini(imageBase64, config.apiKey, config.model || 'gemini-1.5-flash')
    console.log('🔵 Résultat Gemini reçu:', result ? '✅ OK' : '❌ Null')
    if (!result) {
      throw new Error('Gemini a retourné null - aucune donnée extraite')
    }
    return result
  }

  throw new Error(`Provider ${config.provider} non supporté`)
}

/**
 * Vérifie si une API d'IA est configurée
 */
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)
}

