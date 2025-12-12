import { NextRequest, NextResponse } from 'next/server'
import { sendExpenseEmail, type EmailData } from '@/lib/email'
import { supabase } from '@/lib/supabase'

// Utilitaire de réponse JSON d'erreur
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status })

function validateEnv() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.TREASURY_EMAIL) {
    console.error('Variables d\'environnement manquantes pour SMTP')
    return jsonError('Configuration serveur manquante', 500)
  }
  return null
}

function validateBody(body: any): { emailData?: EmailData; error?: NextResponse } {
  const { userEmail, date, branch, expenseType, amount, description, imageBase64, fileName } = body || {}
  if (!userEmail || !date || !branch || !expenseType || !amount || !imageBase64 || !fileName) {
    return { error: jsonError('Données manquantes', 400) }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userEmail)) {
    return { error: jsonError('Format email invalide', 400) }
  }
  const amountNumber = parseFloat(amount)
  if (isNaN(amountNumber) || amountNumber <= 0) {
    return { error: jsonError('Montant invalide', 400) }
  }
  return {
    emailData: { userEmail, date, branch, expenseType, amount, description: description || '', imageBase64, fileName }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Env vars (si SMTP non configuré → mode démo sans envoi réel)
    const envError = validateEnv()
    // Body & validation
    const body = await req.json().catch(() => null)
    if (!body) return jsonError('Corps de requête invalide', 400)
    const { emailData, error } = validateBody(body)
    if (error || !emailData) return error as NextResponse

    // Enregistrer d'abord la dépense en base (Supabase)
    try {
      if (!supabase) throw new Error('Supabase non configuré')
      const amountNumber = parseFloat(emailData.amount)
      const expenseId = `exp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
      const merchant = (emailData.description?.split(' - ')[0] || '').trim() || 'Marchand inconnu'
      // Utiliser le téléphone authentifié (si présent) pour isoler les données utilisateur
      const cookiePhone = req.headers.get('x-user-phone') || ''
      const whatsappFrom = cookiePhone || emailData.userEmail // fallback legacy
      const { data, error } = await supabase
        .from('whatsapp_expenses')
        .insert({
          expense_id: expenseId,
          amount: isNaN(amountNumber) ? null : amountNumber,
          merchant,
          description: emailData.description || null,
          category: emailData.branch || null,
          confidence: 0.7,
          raw_text: emailData.expenseType || null,
          whatsapp_from: whatsappFrom,
          source: 'web-form',
          received_at: emailData.date ? new Date(emailData.date).toISOString() : new Date().toISOString(),
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          image_url: null,
          image_data: emailData.imageBase64
        })
        .select('*')
        .single()
      if (error) throw error
      // Retourner succès sans envoyer d'email pour le moment
      return NextResponse.json({ success: true, message: 'Dépense enregistrée', expense: data })
    } catch (dbErr) {
      console.error('❌ Erreur enregistrement Supabase:', dbErr)
      return jsonError('Erreur enregistrement base', 500)
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    if (error instanceof Error) {
      if (error.message.startsWith('INVALID_IMAGE:')) return jsonError('Image invalide ou corrompue. Veuillez reprendre la photo/import.', 400)
      if (error.message === 'SMTP_FROM_UNDEFINED') return jsonError('Expéditeur SMTP manquant. Définissez SMTP_FROM ou SMTP_FROM_EMAIL.', 500)
      if (error.message.includes('Invalid login')) return jsonError('Erreur d\'authentification SMTP. Vérifiez les identifiants.', 500)
      if (error.message.includes('SMTP')) return jsonError('Erreur de connexion SMTP. Vérifiez la configuration.', 500)
    }
    return jsonError('Erreur interne du serveur', 500)
  }
}