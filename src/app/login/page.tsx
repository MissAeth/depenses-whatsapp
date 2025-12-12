'use client'

import { useState } from 'react'

function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  
  // Si commence par 0 (format français local), remplacer par 33
  if (digits.startsWith('0')) {
    digits = '33' + digits.substring(1)
  }
  // Si commence par 6 ou 7 sans indicatif (mobile français), ajouter 33
  else if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) {
    digits = '33' + digits
  }
  
  return digits
}

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ Connecté. Redirection...')
        setTimeout(() => {
          window.location.href = '/?tab=expenses'
        }, 800)
      } else {
        setMessage('❌ ' + (data.error || 'Échec connexion'))
      }
    } catch (e) {
      setMessage('❌ Erreur réseau')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 relative overflow-hidden'>
      {/* Effets de fond subtils */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-700/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-indigo-800/20 rounded-full blur-3xl"></div>
      </div>

      {/* Logo/Icon en haut */}
      <div className="relative z-10 mb-6 mt-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-md p-2 sm:p-3 shadow-2xl border-2 border-white/20">
          <img 
            src="/smart-expense-logo.png?v=2" 
            alt="SmartExpense Logo" 
            className="w-full h-full object-contain"
            loading="eager"
            onError={(e) => {
              console.error('Erreur chargement logo:', e)
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl"><span class="text-white text-3xl sm:text-4xl md:text-5xl font-black">SE</span></div>'
              }
            }}
          />
        </div>
      </div>

      {/* Titre WELCOME */}
      <div className="relative z-10 mb-4 sm:mb-6">
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-wide drop-shadow-2xl text-center'>
          WELCOME
        </h1>
      </div>

      {/* Texte descriptif */}
      <div className="relative z-10 mb-6 sm:mb-8 max-w-sm sm:max-w-md w-full px-4">
        <p className='text-sm sm:text-base md:text-lg text-blue-100/80 text-center leading-relaxed'>
          Entrez votre numéro de téléphone pour accéder à vos dépenses et gérer vos notes de frais en toute simplicité.
        </p>
      </div>

      {/* Points de navigation */}
      <div className="relative z-10 mb-6 sm:mb-8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/40"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/40"></div>
      </div>

      {/* Formulaire de connexion */}
      <div className='relative z-10 max-w-sm sm:max-w-md w-full px-4'>
        <form onSubmit={submit} className='space-y-3 sm:space-y-4'>
          <div>
            <input
              type='tel'
              placeholder='Ex: 06 12 34 56 78'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='w-full p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 text-blue-900 placeholder:text-blue-400/60 font-medium shadow-xl text-center text-base sm:text-lg'
            />
            <p className='text-xs text-blue-200/70 mt-1.5 sm:mt-2 text-center px-2'>
              Formats acceptés : 06..., 07..., +33 6...
            </p>
          </div>
          
          {message && (
            <div className={`p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold text-center ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-100 border border-green-300/30' 
                : 'bg-red-500/20 text-red-100 border border-red-300/30'
            }`}>
              {message}
            </div>
          )}

          {/* Bouton Log In */}
          <button 
            disabled={loading || normalizePhone(phone).length < 6} 
            className='w-full p-3.5 sm:p-4 bg-white text-blue-900 rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg shadow-2xl active:scale-[0.98] sm:hover:scale-[1.02] transition-all duration-300 disabled:transform-none'
          >
            {loading ? 'Connexion…' : 'Log In'}
          </button>
        </form>
      </div>

      {/* Watermark/Logo en arrière-plan - masqué sur mobile */}
      <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 opacity-10 pointer-events-none">
        <span className="text-6xl font-black text-white">SmartExpense</span>
      </div>
    </div>
  )
}
