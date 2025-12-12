import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface DuplicateCheckResult {
  isDuplicate: boolean
  duplicates: Array<{
    id: string
    expense_id: string
    amount: number
    merchant: string
    description: string
    category: string
    received_at: string
    similarity: number
  }>
}

// Calcul de similarité entre deux chaînes (Levenshtein simplifié)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  // Distance de Levenshtein simplifiée
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1.0
  
  // Sous-chaîne commune
  if (longer.includes(shorter) || shorter.includes(longer)) return 0.8
  
  // Mots communs
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  const commonWords = words1.filter(w => words2.includes(w))
  
  if (commonWords.length > 0) {
    return commonWords.length / Math.max(words1.length, words2.length)
  }
  
  return 0
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, merchant, date, whatsapp_from } = body

    if (!amount || !merchant || !date) {
      return NextResponse.json(
        { error: 'Paramètres manquants (amount, merchant, date requis)' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur connecté
    const userPhone = req.headers.get('x-user-phone') || whatsapp_from || ''
    
    if (!userPhone) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Parser le montant
    const targetAmount = parseFloat(amount)
    if (isNaN(targetAmount)) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    // Calculer la plage de montant (±5%)
    const amountMin = targetAmount * 0.95
    const amountMax = targetAmount * 1.05

    // Parser la date et obtenir le début/fin du jour
    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Vérifier que Supabase est configuré
    if (!supabase) {
      return NextResponse.json(
        { error: 'Base de données non configurée' },
        { status: 500 }
      )
    }

    // Requête Supabase pour trouver les doublons potentiels
    const { data: potentialDuplicates, error } = await supabase
      .from('whatsapp_expenses')
      .select('*')
      .eq('whatsapp_from', userPhone)
      .neq('status', 'rejetee') // Ignorer les dépenses rejetées
      .gte('amount', amountMin)
      .lte('amount', amountMax)
      .gte('received_at', startOfDay.toISOString())
      .lte('received_at', endOfDay.toISOString())

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des doublons' },
        { status: 500 }
      )
    }

    // Filtrer et scorer les résultats
    const duplicates = (potentialDuplicates || [])
      .map(expense => {
        const merchantSimilarity = calculateSimilarity(merchant, expense.merchant)
        const amountDiff = Math.abs(targetAmount - expense.amount) / targetAmount
        
        // Score de similarité (0-100%)
        // 60% basé sur le marchand, 40% sur le montant
        const similarity = (merchantSimilarity * 0.6 + (1 - amountDiff) * 0.4) * 100
        
        return {
          id: expense.id,
          expense_id: expense.expense_id,
          amount: expense.amount,
          merchant: expense.merchant,
          description: expense.description || '',
          category: expense.category || '',
          received_at: expense.received_at,
          similarity: Math.round(similarity)
        }
      })
      .filter(dup => dup.similarity >= 70) // Seuil de 70%
      .sort((a, b) => b.similarity - a.similarity) // Trier par similarité décroissante

    const result: DuplicateCheckResult = {
      isDuplicate: duplicates.length > 0,
      duplicates
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur lors de la vérification des doublons:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
