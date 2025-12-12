'use client'

import { useEffect, useState } from 'react'

export default function GuardedExpenses() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    // Vérifie si cookie user_phone présent en appelant une route qui renverra 401 sans cookie
    fetch('/api/whatsapp-expenses')
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) return <div className='p-6'>Chargement…</div>
  if (!authed) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }
  if (typeof window !== 'undefined') window.location.href = '/?tab=expenses'
  return null
}
