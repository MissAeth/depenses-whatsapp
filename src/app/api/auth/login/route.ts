import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

function normalizePhone(input: string): string {
  if (!input) return ''
  let digits = input.replace(/\D/g, '')
  
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const phone = normalizePhone(body?.phone || '')
    if (!phone || phone.length < 6) {
      return NextResponse.json({ success: false, error: 'Numéro invalide' }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe dans la base de données
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, phone, is_active, role')
      .or(`phone.eq.${phone},phone.eq.+${phone}`)
      .single()

    if (dbError || !user) {
      return NextResponse.json(
        { success: false, error: 'Numéro non enregistré. Contactez un administrateur.' },
        { status: 401 }
      )
    }

    // Vérifier que le compte est actif
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Compte désactivé. Contactez un administrateur.' },
        { status: 403 }
      )
    }

    const res = NextResponse.json({ success: true, phone: user.phone })
    // Cookie HTTPOnly, 30 jours
    res.cookies.set('user_phone', user.phone, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ success: false, error: 'Erreur auth' }, { status: 500 })
  }
}
