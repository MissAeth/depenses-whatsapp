import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || req.headers.get('x-auth-token')

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Vérifier que le token existe (simple vérification)
    // En production, il faudrait vérifier la validité du token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [username] = decoded.split(':')
      
      if (username === 'compte-test') {
        return NextResponse.json({
          authenticated: true,
          user: username
        })
      }
    } catch {
      // Token invalide
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  } catch (error) {
    console.error('Erreur vérification auth:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}

