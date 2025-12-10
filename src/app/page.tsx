import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirection immédiate côté serveur vers WhatsApp
  redirect('/whatsapp')
}

