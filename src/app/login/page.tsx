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
    <div className='min-h-screen flex items-center justify-center bg-zinc-50 p-4'>
      <div className='bg-white max-w-md w-full p-6 rounded-lg border border-zinc-200 shadow-sm'>
        <h1 className='text-2xl font-semibold mb-4'>Connexion par téléphone</h1>
        <p className='text-sm text-zinc-600 mb-4'>Entrez votre numéro (même que WhatsApp) pour accéder à vos dépenses.</p>
        <form onSubmit={submit} className='space-y-3'>
          <input
            type='tel'
            placeholder='Ex: 06 12 34 56 78 ou +33 6 12 34 56 78'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className='w-full p-3 border border-zinc-300 rounded'
          />
          <p className='text-xs text-zinc-500'>
            Formats acceptés : 06..., 07..., +33 6..., +33 7... (convertis automatiquement en 336... ou 337...)
          </p>
          <button disabled={loading || normalizePhone(phone).length < 6} className='w-full p-3 bg-zinc-900 text-white rounded disabled:opacity-50'>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        {message && <p className='text-sm mt-3'>{message}</p>}

        <hr className='my-4' />
        <button onClick={logout} className='text-sm text-zinc-600 hover:text-zinc-900'>Se déconnecter</button>
      </div>
    </div>
  )
}
