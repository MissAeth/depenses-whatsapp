import { NextRequest, NextResponse } from 'next/server'
import { deleteAdminSession, logAdminAction } from '@/lib/auth-admin'

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('admin_session')?.value
    
    if (sessionToken) {
      // Supprimer la session de la base de données
      await deleteAdminSession(sessionToken)
    }

    // Créer la réponse
    const response = NextResponse.json({ success: true })
    
    // Supprimer les cookies
    response.cookies.delete('admin_session')
    response.cookies.delete('user_phone')

    return response

  } catch (error) {
    console.error('Erreur logout admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
