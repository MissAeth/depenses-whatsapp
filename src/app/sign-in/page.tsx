'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { isAuthenticated } from '@/lib/auth'

export default function SignInPage() {
  const router = useRouter()
  const [username, setUsername] = useState('compte-test')
  const [password, setPassword] = useState('test1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/')
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
        
        // Rediriger vers la page d'accueil
        router.push('/')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center p-6">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 md:mx-auto">
        {/* Card de connexion */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-700/50 p-6 md:p-8 ring-1 ring-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm bg-white/90 p-1.5 md:p-2 ring-2 ring-blue-400/50 border border-blue-300/30 mx-auto mb-3 md:mb-4">
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
                    target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700"><span class="text-white text-2xl md:text-3xl font-black">SE</span></div>'
                  }
                }}
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-white mb-2">
              Connexion
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium">
              Accédez à votre espace de gestion des dépenses
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-white mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 backdrop-blur-sm bg-slate-700/40 border-2 border-slate-600/60 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 hover:border-slate-500/80 shadow-sm text-white placeholder:text-slate-400 font-medium text-sm md:text-base"
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 backdrop-blur-sm bg-slate-700/40 border-2 border-slate-600/60 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 hover:border-slate-500/80 shadow-sm text-white placeholder:text-slate-400 font-medium text-sm md:text-base"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-900/40 to-rose-900/40 border-2 border-red-500/60 text-red-100 text-sm font-medium backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-700/90 hover:to-blue-800/90 text-white rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-black text-xs md:text-sm hover:scale-105 disabled:transform-none border border-blue-400/30 ring-1 ring-blue-300/20 flex items-center justify-center gap-2"
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
          <div className="mt-6 p-4 rounded-2xl backdrop-blur-sm bg-slate-700/30 border border-slate-600/50">
            <p className="text-xs text-slate-400 font-medium text-center">
              Compte de test : <span className="text-blue-400 font-bold">compte-test</span> / <span className="text-blue-400 font-bold">test1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

