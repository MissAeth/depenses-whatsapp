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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Effets de fond animés modernes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/25 to-blue-500/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/30 to-blue-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 md:mx-auto">
        {/* Card de connexion moderne avec fond bleu transparent */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-600/40 via-blue-700/35 to-blue-800/40 rounded-3xl shadow-2xl border border-blue-300/30 p-8 md:p-10 hover:shadow-3xl transition-all duration-500 ring-2 ring-blue-200/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden bg-white/95 p-2 md:p-2.5 ring-4 ring-white/30 border-2 border-white/40 mx-auto mb-6 hover:scale-110 transition-transform duration-300">
              <img 
                src="/smart-expense-logo.png?v=2" 
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
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
              Connexion
            </h1>
            <p className="text-sm md:text-base text-blue-50/90 font-medium">
              Accédez à votre espace de gestion des dépenses
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-white mb-2 drop-shadow-sm">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 backdrop-blur-md bg-white/80 border-2 border-white/40 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-white/30 focus:border-white/60 transition-all duration-300 hover:border-white/50 shadow-lg text-blue-900 placeholder:text-blue-400/70 font-medium text-sm md:text-base"
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-2 drop-shadow-sm">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 backdrop-blur-md bg-white/80 border-2 border-white/40 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-white/30 focus:border-white/60 transition-all duration-300 hover:border-white/50 shadow-lg text-blue-900 placeholder:text-blue-400/70 font-medium text-sm md:text-base"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 rounded-xl backdrop-blur-md bg-red-500/20 border-2 border-red-300/40 text-red-50 text-sm font-semibold shadow-lg">
                {error}
              </div>
            )}

            {/* Bouton de connexion moderne */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-4 md:py-5 bg-gradient-to-r from-white/90 via-white/95 to-white/90 hover:from-white hover:via-white hover:to-white text-blue-900 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl font-bold text-sm md:text-base hover:scale-[1.02] disabled:transform-none border-2 border-white/50 ring-2 ring-white/30 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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

          {/* Informations de test moderne */}
          <div className="mt-8 p-5 rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
            <p className="text-sm text-blue-50 font-semibold text-center">
              Compte de test : <span className="text-white font-bold">compte-test</span> / <span className="text-white font-bold">test1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

