'use client'

/**
 * Fonctions utilitaires pour l'authentification côté client
 */

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function getAuthUser(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_user')
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    'x-auth-token': token || '',
  }
}

