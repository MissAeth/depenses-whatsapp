import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminSession, updateLastLogin, logAdminAction } from '@/lib/auth-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const { phone, password } = body || {}

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Téléphone et mot de passe requis' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Base de données non configurée' },
        { status: 500 }
      )
    }

    // Normaliser le téléphone
    const normalizedPhone = normalizePhone(phone)

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('is_active', true)
      .eq('role', 'admin')
      .single()

    if (userError || !user) {
      await logFailedLogin(normalizedPhone, req)
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    // Note: En production, utilisez bcrypt pour hasher les mots de passe
    // Pour l'instant, on utilise une comparaison simple (À AMÉLIORER !)
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      await logFailedLogin(normalizedPhone, req)
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Créer une session admin
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    const sessionToken = await createAdminSession(user.id, ipAddress, userAgent)

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Erreur création session' },
        { status: 500 }
      )
    }

    // Mettre à jour last_login
    await updateLastLogin(user.id)

    // Logger l'action
    await logAdminAction(user.id, 'admin_login', undefined, { phone: normalizedPhone }, ipAddress)

    // Créer la réponse avec cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

    // Cookie de session admin (8 heures)
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 heures
      path: '/'
    })

    // Cookie user_phone pour compatibilité
    response.cookies.set('user_phone', normalizedPhone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Erreur login admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

// Vérifier le mot de passe
async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) return false
  
  // TEMPORAIRE: Comparaison simple pour le développement
  // TODO: Implémenter bcrypt en production
  // const bcrypt = require('bcrypt')
  // return bcrypt.compare(password, hash)
  
  // Pour le moment, on accepte le mot de passe en clair si hash commence par "plain:"
  if (hash.startsWith('plain:')) {
    return password === hash.substring(6)
  }
  
  // Sinon, comparaison directe (NON SÉCURISÉ - pour dev uniquement)
  return password === hash
}

// Logger une tentative de connexion échouée
async function logFailedLogin(phone: string, req: NextRequest): Promise<void> {
  if (!supabase) return
  
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  
  await supabase
    .from('admin_logs')
    .insert({
      admin_id: null,
      action: 'failed_login',
      details: { phone, reason: 'invalid_credentials' },
      ip_address: ipAddress
    })
}

// Normaliser le numéro de téléphone
function normalizePhone(input: string): string {
  if (!input) return ''
  let digits = input.replace(/\D/g, '')
  
  if (digits.startsWith('0')) {
    digits = '33' + digits.substring(1)
  } else if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) {
    digits = '33' + digits
  }
  
  if (!digits.startsWith('+')) {
    digits = '+' + digits
  }
  
  return digits
}
