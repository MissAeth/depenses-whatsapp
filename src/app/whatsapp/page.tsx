'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DevicePhoneMobileIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon, PhotoIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { isAuthenticated } from '@/lib/auth'

interface WhatsAppExpense {
  id: string
  amount: number
  merchant: string
  category: string
  description: string
  confidence: number
  source: string
  whatsapp_from: string
  original_message?: string
  received_at: string
  processed_at: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function WhatsAppPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<WhatsAppExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResult, setTestResult] = useState('')
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageCaption, setImageCaption] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const expensesRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/sign-in')
      return
    }
    setCheckingAuth(false)
  }, [router])

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (checkingAuth) return
    
    const interval = setInterval(() => {
      if (!loading && !sending) {
        loadExpenses(true) // Silent refresh
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading, sending, checkingAuth])

  // Charger les dépenses au démarrage (seulement si authentifié)
  useEffect(() => {
    if (!checkingAuth && isAuthenticated()) {
      loadExpenses()
    }
  }, [checkingAuth])

  // Scroll vers le haut quand une nouvelle dépense arrive
  useEffect(() => {
    if (expenses.length > 0 && expensesRef.current) {
      const observer = new MutationObserver(() => {
        expensesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      observer.observe(expensesRef.current, { childList: true })
      return () => observer.disconnect()
    }
  }, [expenses.length])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove après 4 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const loadExpenses = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setIsRefreshing(true)
    }
    
    try {
      const response = await fetch('/api/whatsapp')
      const data = await response.json()
      
      if (data.success) {
        const previousCount = expenses.length
        setExpenses(data.expenses)
        setLastRefresh(new Date())
        
        // Notification si nouvelle dépense
        if (!silent && data.expenses.length > previousCount) {
          const newCount = data.expenses.length - previousCount
          showToast(`✨ ${newCount} nouvelle${newCount > 1 ? 's' : ''} dépense${newCount > 1 ? 's' : ''} reçue${newCount > 1 ? 's' : ''} !`, 'success')
        }
      } else {
        if (!silent) {
          showToast('❌ Erreur lors du chargement des dépenses', 'error')
        }
      }
    } catch (error) {
      console.error('Erreur chargement dépenses:', error)
      if (!silent) {
        showToast('❌ Erreur de connexion', 'error')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('❌ L\'image est trop volumineuse (max 10MB)', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      showToast('❌ Veuillez sélectionner un fichier image', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Convertir en base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setSelectedImage(base64String)
      showToast('✅ Image sélectionnée avec succès', 'success')
    }
    reader.onerror = () => {
      showToast('❌ Erreur lors de la lecture de l\'image', 'error')
    }
    reader.readAsDataURL(file)
  }

  const simulateWhatsAppMessage = async () => {
    if (activeTab === 'text' && !testMessage.trim()) {
      showToast('⚠️ Veuillez saisir un message', 'error')
      return
    }
    if (activeTab === 'image' && !selectedImage) {
      showToast('⚠️ Veuillez sélectionner une image', 'error')
      return
    }

    setSending(true)
    setTestResult('')
    showToast('📤 Envoi en cours...', 'info')

    try {
      const requestBody: any = {
        from: 'test_user',
        timestamp: new Date().toISOString()
      }

      if (activeTab === 'text') {
        requestBody.text = testMessage
        requestBody.message = testMessage
      } else if (activeTab === 'image') {
        requestBody.imageBase64 = selectedImage
        requestBody.media = {
          type: 'image',
          url: selectedImage,
          caption: imageCaption || ''
        }
        requestBody.text = imageCaption || ''
        requestBody.message = imageCaption || ''
      }

      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult(`✅ Succès: ${data.message}`)
        showToast('✅ Message envoyé avec succès !', 'success')
        
        // Reset form
        setTestMessage('')
        setSelectedImage(null)
        setImageCaption('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        
        // Recharger les dépenses après un court délai
        setTimeout(() => {
          loadExpenses()
        }, 1500)
      } else {
        const errorMsg = data.error || data.details || 'Erreur inconnue'
        setTestResult(`❌ Erreur: ${errorMsg}`)
        showToast(`❌ ${errorMsg}`, 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur réseau'
      setTestResult(`❌ Erreur réseau: ${errorMessage}`)
      showToast(`❌ Erreur de connexion: ${errorMessage}`, 'error')
    } finally {
      setSending(false)
    }
  }


  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'à l\'instant'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours}h`
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Afficher un loader pendant la vérification de l'authentification
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Système de notifications Toast */}
      <div className="fixed top-20 right-24 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`backdrop-blur-xl rounded-2xl shadow-2xl border-2 p-4 min-w-[300px] max-w-md animate-slide-in-right ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              )}
              <p className="font-bold text-sm flex-1">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header moderne avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-100/90 border-b border-slate-300/50 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm bg-white/90 p-1.5 ring-2 ring-amber-300/50 border border-amber-200/30">
                <img 
                  src="/smart-expense-logo.png" 
                  alt="Smart Expense Logo" 
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-400"><span class="text-white text-2xl font-black">SE</span></div>'
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-amber-600 to-slate-900 tracking-tight">
                  Smart Expense WhatsApp
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Réception automatique • IA Gemini
                  {isRefreshing && <span className="ml-2 animate-pulse">🔄</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12 relative z-10">
        {/* Zone de test - Design moderne avec glassmorphism */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/80 via-slate-800/70 to-slate-900/80 rounded-3xl shadow-xl border border-slate-700/50 p-8 mb-8 hover:shadow-2xl transition-all duration-500 ring-1 ring-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-amber-400/80 to-yellow-400/80 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50 border border-amber-300/30">
              <PaperAirplaneIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Simulateur WhatsApp</h2>
              <p className="text-sm text-slate-300 font-medium">Testez la réception automatique de dépenses</p>
            </div>
          </div>

          {/* Onglets modernes */}
          <div className="flex gap-3 mb-8 p-1.5 backdrop-blur-sm bg-slate-700/40 rounded-2xl border border-slate-600/50">
            <button
              onClick={() => {
                setActiveTab('text')
                setTestResult('')
              }}
              className={`flex-1 px-6 py-3.5 flex items-center justify-center gap-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${
                activeTab === 'text'
                  ? 'backdrop-blur-sm bg-gradient-to-r from-amber-400/80 to-yellow-400/80 text-white shadow-lg scale-105 border border-amber-300/30 ring-1 ring-amber-200/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              Message texte
            </button>
            <button
              onClick={() => {
                setActiveTab('image')
                setTestResult('')
              }}
              className={`flex-1 px-6 py-3.5 flex items-center justify-center gap-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${
                activeTab === 'image'
                  ? 'backdrop-blur-sm bg-gradient-to-r from-amber-400/80 to-yellow-400/80 text-white shadow-lg scale-105 border border-amber-300/30 ring-1 ring-amber-200/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <PhotoIcon className="w-5 h-5" />
              Image
            </button>
          </div>
          
          <div className="space-y-6">
            {activeTab === 'text' ? (
              <>
                <div>
                  <label htmlFor="test-message" className="block text-sm font-bold text-white mb-3">
                    Message de test
                    {testMessage.trim() && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">
                        ({testMessage.length} caractères)
                      </span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="test-message"
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Ex: Restaurant Le Bistrot 25.50€"
                      className="flex-1 p-4 backdrop-blur-sm bg-slate-700/40 border-2 border-slate-600/60 rounded-2xl focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300 hover:border-slate-500/80 shadow-sm text-white placeholder:text-slate-400 font-medium"
                      onKeyPress={(e) => e.key === 'Enter' && !sending && testMessage.trim() && simulateWhatsAppMessage()}
                      disabled={sending}
                    />
                    <button
                      onClick={simulateWhatsAppMessage}
                      disabled={sending || !testMessage.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 font-black text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                    >
                      {sending ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Exemples de messages - Design moderne */}
                <div>
                  <p className="text-sm font-bold text-slate-300 mb-3">Exemples à tester:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "Restaurant Le Petit Bistrot 23.50€",
                      "Taxi aéroport 45€", 
                      "dépense essence 67.30€",
                      "Hotel Berlin 120€/nuit",
                      "ticket restaurant voir photo"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTestMessage(example)
                          showToast('✅ Exemple chargé', 'success')
                        }}
                        className="px-4 py-2 backdrop-blur-sm bg-slate-700/40 border border-slate-600/60 text-slate-200 rounded-xl hover:bg-amber-500/30 hover:border-amber-400 hover:text-white transition-all duration-300 text-sm font-medium hover:scale-105 shadow-sm"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="image-upload" className="block text-sm font-bold text-white mb-3">
                    Sélectionner une image
                    {selectedImage && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">✅ Image sélectionnée</span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <label
                      htmlFor="image-upload"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="p-6 border-2 border-dashed border-slate-600/60 rounded-2xl hover:border-amber-400 hover:bg-slate-700/40 transition-all duration-300 text-center shadow-sm group backdrop-blur-sm bg-slate-700/30">
                        {selectedImage ? (
                          <div className="space-y-3">
                            <img
                              src={selectedImage}
                              alt="Aperçu"
                              className="max-h-40 mx-auto rounded-xl shadow-lg ring-2 ring-slate-600"
                            />
                            <p className="text-sm text-slate-300 font-medium">Cliquez pour changer d'image</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 py-6">
                            <div className="w-16 h-16 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-amber-500/40 to-yellow-500/40 flex items-center justify-center group-hover:from-amber-500/50 group-hover:to-yellow-500/50 transition-all border border-amber-400/30 ring-1 ring-amber-300/20">
                              <PhotoIcon className="w-8 h-8 text-amber-300" />
                            </div>
                            <p className="text-sm text-slate-300 font-medium">Cliquez pour sélectionner une image</p>
                            <p className="text-xs text-slate-400">JPG, PNG, WEBP (max 10MB)</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="image-caption" className="block text-sm font-bold text-white mb-3">
                    Message optionnel (légende)
                    {imageCaption && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">
                        ({imageCaption.length} caractères)
                      </span>
                    )}
                  </label>
                  <input
                    id="image-caption"
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Ex: Ticket restaurant du 15/01"
                    className="w-full p-4 backdrop-blur-sm bg-slate-700/40 border-2 border-slate-600/60 rounded-2xl focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300 hover:border-slate-500/80 shadow-sm text-white placeholder:text-slate-400 font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && !sending && selectedImage && simulateWhatsAppMessage()}
                    disabled={sending}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={simulateWhatsAppMessage}
                    disabled={sending || !selectedImage}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 font-black text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Envoyer l'image
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Résultat du test - Design moderne */}
            {testResult && (
              <div className={`p-4 rounded-2xl text-sm font-medium border-2 shadow-lg animate-fade-in backdrop-blur-sm ${
                testResult.startsWith('✅') 
                  ? 'bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/60 text-emerald-100' 
                  : 'bg-gradient-to-r from-red-900/40 to-rose-900/40 border-red-500/60 text-red-100'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Liste des dépenses - Design moderne */}
        <div ref={expensesRef} className="backdrop-blur-xl bg-gradient-to-br from-slate-800/80 via-slate-800/70 to-slate-900/80 rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transition-all duration-500 ring-1 ring-white/10">
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-amber-400/80 to-yellow-400/80 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50 border border-amber-300/30">
                  <EyeIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Factures WhatsApp</h2>
                  <p className="text-sm text-slate-300 font-medium">
                    {expenses.length} dépense{expenses.length > 1 ? 's' : ''} reçue{expenses.length > 1 ? 's' : ''}
                    {lastRefresh && (
                      <span className="ml-2 text-xs text-slate-400">
                        • Dernière mise à jour: {formatTimeAgo(lastRefresh)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadExpenses()}
                disabled={loading}
                className="flex items-center gap-2.5 px-6 py-3.5 text-sm text-white backdrop-blur-sm bg-gradient-to-r from-yellow-400/80 to-amber-400/80 hover:from-yellow-500/90 hover:to-amber-500/90 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-black hover:scale-105 border border-yellow-300/30 ring-1 ring-yellow-200/20"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-700/50">
            {expenses.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 backdrop-blur-sm bg-gradient-to-br from-slate-700/60 to-slate-600/60 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-600/50">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Aucune dépense WhatsApp reçue</p>
                <p className="text-sm text-slate-300 font-medium">Testez avec le simulateur ci-dessus</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="p-8 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/40 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-400">
                          {expense.amount}€
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-md bg-gradient-to-r from-amber-500/50 to-yellow-500/50 border border-amber-400/70 text-amber-100 text-xs font-black rounded-full shadow-sm ring-1 ring-amber-300/30">
                          {expense.category}
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-sm bg-slate-700/40 border border-slate-600/60 text-slate-200 text-xs font-black rounded-full">
                          WhatsApp
                        </span>
                        <span className="px-4 py-1.5 backdrop-blur-sm bg-slate-700/40 border border-slate-600/60 text-slate-200 text-xs font-black rounded-full">
                          {Math.round(expense.confidence * 100)}% confiance
                        </span>
                      </div>
                      <p className="text-white font-black text-xl mb-2">{expense.merchant}</p>
                      <p className="text-sm text-slate-300 font-medium">{expense.description}</p>
                    </div>
                  </div>

                  {expense.original_message && (
                    <div className="backdrop-blur-sm bg-slate-700/40 p-5 rounded-2xl border border-slate-600/60 mt-4 shadow-sm">
                      <p className="text-sm text-slate-200 mb-2 font-medium">
                        <strong className="text-white font-black">Message original:</strong> &quot;{expense.original_message}&quot;
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                        <span>De:</span>
                        <span className="font-bold text-slate-300">{expense.whatsapp_from}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(expense.received_at).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions - Design moderne compact */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-200/60 to-yellow-200/60 rounded-3xl shadow-lg border border-amber-400/50 p-6 hover:shadow-xl transition-all duration-500 ring-1 ring-amber-300/30">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2.5 text-lg">
              <span className="text-2xl">🆓</span>
              <span>Bot WhatsApp Gratuit</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-700 font-medium">
              <p className="font-black text-slate-900 mb-2">📱 Comment utiliser:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Lancez: <code className="backdrop-blur-sm bg-white/70 px-2 py-1 rounded-lg text-slate-900 font-bold text-xs border border-amber-400/50">npm run whatsapp-bot</code></li>
                <li>Scannez le QR code avec WhatsApp</li>
                <li>Envoyez une photo de ticket</li>
                <li>La dépense apparaît automatiquement!</li>
              </ol>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-200/60 to-yellow-200/60 rounded-3xl shadow-lg border border-amber-400/50 p-6 hover:shadow-xl transition-all duration-500 ring-1 ring-amber-300/30">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2.5 text-lg">
              <span className="text-2xl">💡</span>
              <span>Instructions</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 font-medium">
              <div className="backdrop-blur-sm bg-white/60 rounded-xl p-3 border border-amber-400/50 shadow-sm">
                <p className="font-black text-slate-900 mb-1 text-xs">Test local</p>
                <p className="text-xs">Utilisez le simulateur ci-dessus</p>
              </div>
              <div className="backdrop-blur-sm bg-white/60 rounded-xl p-3 border border-amber-400/50 shadow-sm">
                <p className="font-black text-slate-900 mb-1 text-xs">Mots-clés détectés</p>
                <p className="text-xs">dépense, ticket, facture, restaurant, taxi, €</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
