'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })

      const data = await res.json()

      if (data.success) {
        // Rediriger vers le dashboard admin
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Identifiants invalides')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Administration SGDF
          </h1>
          <p className="text-sm text-zinc-600">
            Espace réservé aux administrateurs
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Ex: +33 6 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              required
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="w-full p-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5" />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-500 text-center">
            Accès sécurisé · Session 8 heures
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full mt-3 text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            Retour à l'accès utilisateur
          </button>
        </div>

        {/* Info de développement (à retirer en production) */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900 font-medium mb-1">
            ℹ️ Mode développement
          </p>
          <p className="text-xs text-blue-700">
            Compte admin par défaut : <br />
            <code className="bg-blue-100 px-1 rounded">+33615722037</code><br />
            Mot de passe : <code className="bg-blue-100 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
