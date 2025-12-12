import { NextRequest, NextResponse } from 'next/server'

// Identifiants de test
const VALID_USERNAME = 'compte-test'
const VALID_PASSWORD = 'test1234'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    // Vérification des identifiants
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Générer un token simple (en production, utiliser JWT ou une vraie session)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      return NextResponse.json({
        success: true,
        token,
        user: username
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Nom d\'utilisateur ou mot de passe incorrect'
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Erreur login:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la connexion'
      },
      { status: 500 }
    )
  }
}

