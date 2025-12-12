import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-admin'

export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        phone: admin.phone,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Erreur vérification admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
