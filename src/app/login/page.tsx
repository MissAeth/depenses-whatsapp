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

  const logout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.reload()
    } catch {}
    setLoading(false)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden'>
      {/* Effets de fond animés subtils */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className='relative z-10 max-w-md w-full'>
        {/* Card bleue avec logo et nom */}
        <div className='backdrop-blur-xl bg-gradient-to-br from-blue-600/90 via-blue-700/85 to-blue-800/90 rounded-3xl shadow-2xl border border-blue-300/30 p-8 md:p-10'>
          {/* Header avec logo et nom */}
          <div className='text-center mb-8'>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white/95 p-2 shadow-xl ring-2 ring-white/30">
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
                      target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700"><span class="text-white text-2xl md:text-3xl font-black">SE</span></div>'
                    }
                  }}
                />
              </div>
              <h1 className='text-3xl md:text-4xl font-bold text-white tracking-tight'>SmartExpense</h1>
            </div>
            <h2 className='text-xl md:text-2xl font-semibold text-white mb-3'>Connexion par téléphone</h2>
            <p className='text-sm md:text-base text-blue-50/90 font-medium'>Entrez votre numéro (même que WhatsApp) pour accéder à vos dépenses.</p>
          </div>

          <form onSubmit={submit} className='space-y-4'>
            <div>
              <input
                type='tel'
                placeholder='Ex: 06 12 34 56 78 ou +33 6 12 34 56 78'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full p-4 border-2 border-white/40 bg-white/90 backdrop-blur-md rounded-xl focus:ring-4 focus:ring-white/30 focus:border-white/60 transition-all duration-300 text-blue-900 placeholder:text-blue-400/70 font-medium shadow-lg'
              />
              <p className='text-xs text-blue-100/80 mt-2'>
                Formats acceptés : 06..., 07..., +33 6..., +33 7... (convertis automatiquement en 336... ou 337...)
              </p>
            </div>
            
            {message && (
              <div className={`p-3 rounded-xl text-sm font-semibold ${
                message.includes('✅') 
                  ? 'bg-green-500/20 text-green-50 border border-green-300/40' 
                  : 'bg-red-500/20 text-red-50 border border-red-300/40'
              }`}>
                {message}
              </div>
            )}

            <button 
              disabled={loading || normalizePhone(phone).length < 6} 
              className='w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:transform-none border-2 border-blue-400/30 ring-2 ring-blue-300/20'
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <hr className='my-6 border-blue-300/30' />
          <button 
            onClick={logout} 
            className='w-full text-sm text-blue-100 hover:text-white font-medium transition-colors'
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
