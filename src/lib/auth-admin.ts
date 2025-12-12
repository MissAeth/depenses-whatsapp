import { supabase } from './supabase'
import { randomBytes } from 'crypto'

export interface User {
  id: string
  phone: string
  email?: string
  name?: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface AdminSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

// Générer un token de session sécurisé
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// Vérifier si un utilisateur est admin
export async function isAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  
  const { data, error } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', userId)
    .single()
  
  if (error || !data) return false
  return data.role === 'admin' && data.is_active === true
}

// Vérifier une session admin
export async function verifyAdminSession(sessionToken: string): Promise<User | null> {
  if (!supabase || !sessionToken) return null
  
  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .select('user_id, expires_at')
    .eq('session_token', sessionToken)
    .single()
  
  if (sessionError || !session) return null
  
  // Vérifier expiration
  if (new Date(session.expires_at) < new Date()) {
    // Session expirée, la supprimer
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', sessionToken)
    return null
  }
  
  // Récupérer les infos utilisateur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user_id)
    .eq('is_active', true)
    .single()
  
  if (userError || !user || user.role !== 'admin') return null
  
  return user
}

// Créer une session admin
export async function createAdminSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string | null> {
  if (!supabase) return null
  
  const sessionToken = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 8) // 8 heures de validité
  
  const { error } = await supabase
    .from('admin_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    })
  
  if (error) {
    console.error('Erreur création session:', error)
    return null
  }
  
  return sessionToken
}

// Supprimer une session admin (logout)
export async function deleteAdminSession(sessionToken: string): Promise<boolean> {
  if (!supabase || !sessionToken) return false
  
  const { error } = await supabase
    .from('admin_sessions')
    .delete()
    .eq('session_token', sessionToken)
  
  return !error
}

// Logger une action admin
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  if (!supabase) return
  
  await supabase
    .from('admin_logs')
    .insert({
      admin_id: adminId,
      action,
      target_user_id: targetUserId,
      details: details || {},
      ip_address: ipAddress
    })
}

// Récupérer tous les utilisateurs (admin only)
export async function getAllUsers(): Promise<User[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erreur récupération users:', error)
    return []
  }
  
  return data || []
}

// Créer un nouvel utilisateur
export async function createUser(
  phone: string,
  name?: string,
  email?: string,
  role: 'user' | 'admin' = 'user',
  createdBy?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) return { success: false, error: 'Base de données non configurée' }
  
  // Normaliser le téléphone
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) {
    return { success: false, error: 'Numéro de téléphone invalide' }
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      phone: normalizedPhone,
      name,
      email,
      role,
      is_active: true,
      created_by: createdBy
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Ce numéro existe déjà' }
    }
    return { success: false, error: error.message }
  }
  
  return { success: true, user: data }
}

// Mettre à jour un utilisateur
export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'is_active' | 'role'>>
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) return { success: false, error: 'Base de données non configurée' }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, user: data }
}

// Supprimer un utilisateur (soft delete = désactiver)
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Base de données non configurée' }
  
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Normaliser le numéro de téléphone
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
  // Ajouter le + si pas déjà présent
  if (!digits.startsWith('+')) {
    digits = '+' + digits
  }
  
  return digits
}

// Récupérer un utilisateur par son téléphone
export async function getUserByPhone(phone: string): Promise<User | null> {
  if (!supabase) return null
  
  const normalizedPhone = normalizePhone(phone)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalizedPhone)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  
  return data
}

// Mettre à jour le last_login
export async function updateLastLogin(userId: string): Promise<void> {
  if (!supabase) return
  
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}
