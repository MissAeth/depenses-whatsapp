'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { isAuthenticated } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('compte-test')
  const [password, setPassword] = useState('test1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/depenses')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Stocker le token dans localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', username)
        
        // Rediriger vers la page des dépenses
        router.push('/depenses')
        router.refresh()
      } else {
        setError(data.error || 'Identifiants incorrects')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
      console.error('Erreur login:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md mx-4 md:mx-auto">
        {/* Card de connexion */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center overflow-hidden bg-zinc-900 p-1.5 md:p-2 mx-auto mb-3 md:mb-4">
              <img 
                src="/smart-expense-logo.jpg?v=1" 
                alt="Smart Expense Logo" 
                className="w-full h-full object-contain"
                loading="eager"
                onError={(e) => {
                  console.error('Erreur chargement logo:', e)
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-zinc-900"><span class="text-white text-2xl md:text-3xl font-black">SE</span></div>'
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-7 h-7 bg-zinc-900 rounded flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                SmartExpense
              </h1>
            </div>
            <p className="text-sm text-zinc-500">
              Accédez à votre espace de gestion des dépenses
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-900 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 md:pr-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors text-zinc-900 placeholder:text-zinc-400 text-sm md:text-base"
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 md:pr-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors text-zinc-900 placeholder:text-zinc-400 text-sm md:text-base"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 md:py-4 bg-zinc-900 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-medium text-sm md:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Informations de test */}
          <div className="mt-6 p-3 rounded-md bg-zinc-50 border border-zinc-200">
            <p className="text-xs text-zinc-600 text-center">
              Compte de test : <span className="text-zinc-900 font-semibold">compte-test</span> / <span className="text-zinc-900 font-semibold">test1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
