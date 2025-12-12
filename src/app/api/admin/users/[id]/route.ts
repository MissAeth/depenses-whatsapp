import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, updateUser, deleteUser, logAdminAction } from '@/lib/auth-admin'

// PUT - Mettre à jour un utilisateur
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: userId } = await params

    // Récupérer les données du corps
    const body = await req.json().catch(() => null)
    const { name, email, phone, is_active, role } = body || {}

    // Empêcher un admin de se désactiver lui-même
    if (userId === admin.id && is_active === false) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous désactiver vous-même' },
        { status: 400 }
      )
    }

    // Mettre à jour l'utilisateur
    const result = await updateUser(userId, {
      name,
      email,
      phone,
      is_active,
      role
    })

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
      'update_user',
      userId,
      { name, email, phone, is_active, role },
      ipAddress
    )

    return NextResponse.json({
      success: true,
      user: result.user
    })

  } catch (error) {
    console.error('Erreur PUT user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer (désactiver) un utilisateur
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: userId } = await params

    // Empêcher un admin de se supprimer lui-même
    if (userId === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 }
      )
    }

    // Supprimer (désactiver) l'utilisateur
    const result = await deleteUser(userId)

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
      'delete_user',
      userId,
      {},
      ipAddress
    )

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Erreur DELETE user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
