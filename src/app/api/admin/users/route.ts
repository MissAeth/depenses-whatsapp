import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, getAllUsers, createUser, logAdminAction } from '@/lib/auth-admin'

// GET - Récupérer tous les utilisateurs
export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const sessionToken = req.cookies.get('admin_session')?.value
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Session invalide ou expirée' },
        { status: 401 }
      )
    }

    // Récupérer tous les utilisateurs
    const users = await getAllUsers()

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        phone: u.phone,
        email: u.email,
        name: u.name,
        role: u.role,
        is_active: u.is_active,
        created_at: u.created_at,
        last_login: u.last_login
      }))
    })

  } catch (error) {
    console.error('Erreur GET users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const sessionToken = req.cookies.get('admin_session')?.value
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Session invalide ou expirée' },
        { status: 401 }
      )
    }

    // Récupérer les données du corps
    const body = await req.json().catch(() => null)
    const { phone, name, email, role } = body || {}

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Créer l'utilisateur
    const result = await createUser(
      phone,
      name,
      email,
      role || 'user',
      admin.id
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Logger l'action
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await logAdminAction(
      admin.id,
      'create_user',
      result.user?.id,
      { phone, name, email, role },
      ipAddress
    )

    return NextResponse.json({
      success: true,
      user: result.user
    })

  } catch (error) {
    console.error('Erreur POST users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
