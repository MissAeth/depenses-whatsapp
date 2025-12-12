import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Ne créer le client que si les variables sont définies
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Interface pour les dépenses
export interface WhatsAppExpense {
  id?: string
  expense_id: string
  amount: number
  merchant: string
  description?: string
  category?: string
  confidence?: number
  raw_text?: string
  whatsapp_from?: string
  source?: string
  received_at?: string
  processed_at?: string
  created_at?: string
  image_url?: string
  image_data?: string
}

// Fonctions utilitaires
export async function saveExpenseToSupabase(expense: WhatsAppExpense) {
  if (!supabase) {
    throw new Error('Supabase non configuré - variables SUPABASE_URL ou SUPABASE_ANON_KEY manquantes')
  }
  
  try {
    console.log('💾 Sauvegarde Supabase:', expense)
    
    const { data, error } = await supabase
      .from('whatsapp_expenses')
      .insert([expense])
      .select()
    
    if (error) {
      console.error('❌ Erreur Supabase:', error)
      throw error
    }
    
    console.log('✅ Dépense sauvegardée en BDD:', data[0])
    return data[0]
  } catch (error) {
    console.error('❌ Erreur sauvegarde Supabase:', error)
    throw error
  }
}

export async function getExpensesFromSupabase(limit = 50) {
  if (!supabase) {
    throw new Error('Supabase non configuré - variables SUPABASE_URL ou SUPABASE_ANON_KEY manquantes')
  }
  
  try {
    console.log('📊 Récupération dépenses Supabase...')
    
    const { data, error } = await supabase
      .from('whatsapp_expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('❌ Erreur récupération Supabase:', error)
      throw error
    }
    
    console.log('✅ Dépenses récupérées:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Erreur récupération Supabase:', error)
    throw error
  }
}

// Sauvegarder une image dans Supabase Storage
export async function saveImageToSupabase(imageBase64: string, expenseId: string): Promise<string | null> {
  if (!supabase) {
    console.error('❌ Supabase non configuré')
    return null
  }
  
  try {
    // Convertir base64 en buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const fileName = `${expenseId}_${Date.now()}.jpg`
    
    console.log('📸 Sauvegarde image:', fileName, '- Taille:', Math.round(imageBuffer.length / 1024), 'KB')
    
    const { data, error } = await supabase.storage
      .from('whatsapp-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Erreur upload image:', error)
      return null
    }
    
    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('whatsapp-images')
      .getPublicUrl(fileName)
    
    console.log('✅ Image sauvée:', urlData.publicUrl)
    return urlData.publicUrl
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde image:', error)
    return null
  }
}

export async function testSupabaseConnection() {
  if (!supabase) {
    console.error('❌ Supabase non configuré')
    return false
  }
  
  try {
    const { data, error } = await supabase
      .from('whatsapp_expenses')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Connexion Supabase OK')
    return true
  } catch (error) {
    console.error('❌ Connexion Supabase échoue:', error)
    return false
  }
}