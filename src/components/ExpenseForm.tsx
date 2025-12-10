'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ClipboardDocumentListIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusCircleIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { processExpenseContent, type ExtractedExpenseData } from '@/lib/ai-processor'

interface ExpenseFormProps {
  readonly capturedImage: string | null
  readonly userEmail: string
  readonly initialBranch?: string // From Clerk public metadata
  readonly onPersistBranch?: (branch: string) => Promise<void> | void
  readonly onCreateNewNote?: () => void
  readonly onBranchChange?: (branch: string) => void
  readonly importedData?: {
    amount?: number
    merchant?: string
    category?: string
    description?: string
    date?: string
  } | null
}

// Catégories de dépenses personnelles
const EXPENSE_CATEGORIES = [
  'Transport',
  'Restauration',
  'Hébergement',
  'Fournitures',
  'Abonnements',
  'Santé',
  'Loisirs',
  'Divers'
]

export function ExpenseForm({ capturedImage, userEmail, initialBranch = '', onPersistBranch, onCreateNewNote, onBranchChange, isOnline = true, importedData = null }: ExpenseFormProps & { isOnline?: boolean }) {
  const [formData, setFormData] = useState({
    date: importedData?.date || new Date().toISOString().split('T')[0],
    branch: importedData?.category || initialBranch || '',
    expenseType: '',
    amount: importedData?.amount ? importedData.amount.toString() : '',
    description: importedData?.description || ''
  })
  const [branchPersistStatus, setBranchPersistStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<ExtractedExpenseData | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Si des données sont importées, pré-remplir le formulaire
  useEffect(() => {
    if (importedData) {
      console.log('📥 Données importées détectées:', importedData)
      setFormData(prev => ({
        ...prev,
        date: importedData.date || prev.date,
        branch: importedData.category || prev.branch,
        amount: importedData.amount ? importedData.amount.toString() : prev.amount,
        description: importedData.description || prev.description
      }))
      
      // Mapper le type de dépense si on a la catégorie
      if (importedData.category && importedData.merchant) {
        const mapCategoryToExpenseType = (category: string, merchant: string): string => {
          const combined = `${merchant.toLowerCase()} ${importedData.description?.toLowerCase() || ''}`.toLowerCase()
          
          if (category === 'Restauration') {
            if (combined.includes('restaurant') || combined.includes('resto') || combined.includes('café') || combined.includes('cafe') || combined.includes('bar')) {
              return 'Restaurant, Bar, Café'
            }
            return 'Courses alimentaires'
          }
          if (category === 'Transport') {
            if (combined.includes('taxi') || combined.includes('uber') || combined.includes('vtc')) return 'Taxi, VTC'
            if (combined.includes('carburant') || combined.includes('essence') || combined.includes('péage')) return 'Carburant, Péage'
            return 'Transport en commun'
          }
          if (category === 'Hébergement') return 'Hôtel, Hébergement'
          if (category === 'Santé') return 'Médecin, Pharmacie'
          if (category === 'Fournitures') return 'Fournitures bureau'
          if (category === 'Abonnements') return 'Abonnement services'
          if (category === 'Loisirs') return 'Loisirs, Culture'
          return 'Autres'
        }
        
        const expenseType = mapCategoryToExpenseType(importedData.category, importedData.merchant || '')
        setFormData(prev => ({ ...prev, expenseType }))
      }
    }
  }, [importedData])

  // Traiter l'image automatiquement avec l'IA quand une nouvelle image arrive
  useEffect(() => {
    if (capturedImage) {
      // Force reset complet des suggestions et retraitement
      console.log('🔄 Nouvelle image détectée, reset complet...')
      setAiSuggestions(null)
      setAiProcessing(false)
      
      // Petit délai pour s'assurer que le reset est visible
      setTimeout(() => {
        processImageWithAI()
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]) // Fermeture correcte du useEffect

  const processImageWithAI = async () => {
    console.log('🎯 processImageWithAI appelé - capturedImage:', !!capturedImage)
    
    if (!capturedImage) {
      console.log('❌ Pas d\'image capturée, arrêt du traitement')
      return
    }

    console.log('🚀 Démarrage traitement avec Gemini...')
    setAiProcessing(true)
    setAiError(null) // Réinitialiser l'erreur
    
    // Reset du formulaire avant nouveau traitement
    setFormData(prev => ({
      ...prev,
      amount: '',
      expenseType: '',
      description: ''
    }))

    try {
      // Utiliser Gemini directement via l'API
      console.log('🤖 Extraction avec Gemini...')
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64: capturedImage })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur API: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('📥 Réponse API:', result)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || result.message || 'Aucune donnée extraite')
      }
      
      const extractedData = result.data
      console.log('✅ Données extraites par Gemini:', extractedData)
      
      // Vérifier que des données valides ont été extraites
      if (extractedData.amount === 0 && extractedData.merchant === 'Marchand inconnu') {
        throw new Error('Aucune information valide n\'a pu être extraite du ticket. Vérifiez que l\'image est claire.')
      }
      
      console.log('💾 Sauvegarde des suggestions Gemini...')
      setAiSuggestions(extractedData)
      setAiError(null)
      
      // Fonction pour mapper la catégorie et le marchand au type de dépense
      const mapCategoryToExpenseType = (category: string, merchant: string, description: string): string => {
        const merchantLower = merchant.toLowerCase()
        const descLower = description.toLowerCase()
        const combined = `${merchantLower} ${descLower}`.toLowerCase()
        
        // Mapping basé sur la catégorie
        if (category === 'Restauration') {
          if (combined.includes('restaurant') || combined.includes('resto') || combined.includes('café') || combined.includes('cafe') || combined.includes('bar') || combined.includes('brasserie') || combined.includes('bistrot')) {
            return 'Restaurant, Bar, Café'
          }
          return 'Courses alimentaires'
        }
        
        if (category === 'Transport') {
          if (combined.includes('taxi') || combined.includes('uber') || combined.includes('bolt') || combined.includes('vtc')) {
            return 'Taxi, VTC'
          }
          if (combined.includes('carburant') || combined.includes('essence') || combined.includes('diesel') || combined.includes('péage') || combined.includes('peage') || combined.includes('station')) {
            return 'Carburant, Péage'
          }
          return 'Transport en commun'
        }
        
        if (category === 'Hébergement') {
          return 'Hôtel, Hébergement'
        }
        
        if (category === 'Santé') {
          return 'Médecin, Pharmacie'
        }
        
        if (category === 'Fournitures') {
          return 'Fournitures bureau'
        }
        
        if (category === 'Abonnements') {
          return 'Abonnement services'
        }
        
        if (category === 'Loisirs') {
          return 'Loisirs, Culture'
        }
        
        return 'Autres'
      }
      
      // Formater la date si elle existe
      let formattedDate = formData.date // Garder la date actuelle par défaut
      if (extractedData.date) {
        try {
          // Vérifier que la date est valide
          const dateObj = new Date(extractedData.date)
          if (!isNaN(dateObj.getTime())) {
            formattedDate = extractedData.date.split('T')[0] // Format YYYY-MM-DD
          }
        } catch (e) {
          console.warn('Date invalide extraite:', extractedData.date)
        }
      }
      
      // Déterminer le type de dépense
      const expenseType = mapCategoryToExpenseType(
        extractedData.category || '',
        extractedData.merchant || '',
        extractedData.description || ''
      )
      
      // Construire la description
      const descriptionParts = []
      if (extractedData.merchant && extractedData.merchant !== 'Marchand inconnu') {
        descriptionParts.push(extractedData.merchant)
      }
      if (extractedData.description && extractedData.description !== 'Description automatique') {
        descriptionParts.push(extractedData.description)
      }
      const finalDescription = descriptionParts.length > 0 ? descriptionParts.join(' - ') : ''
      
      console.log('📝 Auto-remplissage du formulaire...')
      setFormData(prev => ({
        ...prev,
        date: formattedDate,
        amount: extractedData.amount > 0 ? extractedData.amount.toString() : '',
        branch: extractedData.category || prev.branch, // Garder la branche précédente si pas de catégorie
        expenseType: expenseType,
        description: finalDescription
      }))
      
      console.log('✨ Traitement Gemini terminé avec succès')
    } catch (error) {
      console.error('❌ Erreur traitement Gemini:', error)
      setAiSuggestions(null)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du traitement de l\'image'
      setAiError(errorMessage)
    } finally {
      console.log('🏁 Fin du traitement')
      setAiProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'branch') {
      if (onBranchChange) {
        onBranchChange(value)
      }
      // Persist branch selection to user metadata (fire & forget)
      if (onPersistBranch && value) {
        setBranchPersistStatus('saving')
        Promise.resolve(onPersistBranch(value))
          .then(() => setBranchPersistStatus('saved'))
          .catch(() => setBranchPersistStatus('error'))
      }
    }
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const formatAmount = (amount: string) => {
    return amount.replace(',', '.')
  }

  const generateFileName = () => {
    const { date, branch, amount, expenseType } = formData
    const formattedAmount = formatAmount(amount)
    const typeShort = expenseType ? expenseType.replace(/\s+/g, ' ').trim() : ''
    return `${date} - ${branch}${typeShort ? ' - ' + typeShort : ''} - ${formattedAmount}.jpg`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!capturedImage || !formData.branch || !formData.expenseType || !formData.amount) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires et capturer une image.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/send-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          date: formData.date,
          branch: formData.branch,
          expenseType: formData.expenseType,
          amount: formatAmount(formData.amount),
          description: formData.description,
          imageBase64: capturedImage,
          fileName: generateFileName()
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Dépense enregistrée avec succès ! Les informations ont été sauvegardées et un email de confirmation a été envoyé.'
        })
        // Reset only variable fields but keep branch (souvent même branche pour plusieurs notes)
        setFormData(prev => ({
          date: new Date().toISOString().split('T')[0],
          branch: prev.branch,
          expenseType: '',
          amount: '',
            description: ''
        }))
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Erreur lors de l\'envoi de l\'email'
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion. Veuillez réessayer.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation complète (inclut type de dépense)
  const isFormValid = capturedImage && formData.branch && formData.expenseType && formData.amount

  const handleNewNote = () => {
    // Clear form (keep branch), clear status, notify parent to reset image & OCR amount
    setFormData(prev => ({
      date: new Date().toISOString().split('T')[0],
      branch: prev.branch,
      expenseType: '',
      amount: '',
      description: ''
    }))
    setSubmitStatus({ type: null, message: '' })
    setAiSuggestions(null) // Clear AI suggestions
    if (onCreateNewNote) onCreateNewNote()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <ClipboardDocumentListIcon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Informations de la dépense</h2>
          <p className="text-xs text-zinc-500">Remplissez les détails de votre dépense</p>
        </div>
      </div>

      {capturedImage && (
        <div className="space-y-3 animate-slide-up">
          <label htmlFor="image-preview" className="block text-sm font-medium text-zinc-700">
            Aperçu du justificatif
          </label>
          <div className="relative rounded-xl overflow-hidden border-2 border-zinc-200 shadow-md">
            <Image
              id="image-preview"
              src={capturedImage}
              alt="Justificatif"
              width={500}
              height={200}
              className="w-full h-48 object-cover"
            />
          </div>
          
          {/* Statut du traitement IA */}
          {aiProcessing && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm animate-pulse">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-blue-900">Analyse en cours avec Gemini...</span>
                <span className="text-xs text-blue-700 mt-0.5">Extraction des données en cours</span>
              </div>
            </div>
          )}
          
          {aiError && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl shadow-sm animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-900 mb-1">Erreur lors de la lecture du ticket</h4>
                  <p className="text-sm text-rose-800">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAiError(null)
                      processImageWithAI()
                    }}
                    className="mt-2 text-xs text-rose-700 hover:text-rose-900 underline font-medium"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {aiSuggestions && !aiError && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm animate-scale-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">Données extraites par Gemini</h4>
                      <p className="text-xs text-green-700 mt-0.5">✨ Intelligence artificielle Google</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔄 Force nouveau traitement IA...')
                        processImageWithAI()
                      }}
                      className="text-xs text-green-700 hover:text-green-900 underline font-medium flex-shrink-0 ml-2"
                    >
                      Retraiter
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800 mb-3">
                    <div className={`bg-white/60 rounded-lg p-2 ${aiSuggestions.amount === 0 ? 'border-2 border-amber-300' : ''}`}>
                      <span className="font-medium">Montant:</span> {aiSuggestions.amount > 0 ? `${aiSuggestions.amount}€` : 'Non détecté'}
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <span className="font-medium">Confiance:</span> {Math.round(aiSuggestions.confidence * 100)}%
                    </div>
                    <div className={`bg-white/60 rounded-lg p-2 col-span-2 ${aiSuggestions.merchant === 'Marchand inconnu' ? 'border-2 border-amber-300' : ''}`}>
                      <span className="font-medium">Marchand:</span> {aiSuggestions.merchant}
                    </div>
                    <div className="bg-white/60 rounded-lg p-2 col-span-2">
                      <span className="font-medium">Catégorie:</span> {aiSuggestions.category}
                    </div>
                  </div>
                  
                  {/* Afficher le texte brut pour débogage (repliable) */}
                  <details className="mt-2">
                    <summary className="text-xs text-green-700 hover:text-green-900 cursor-pointer font-medium">
                      📄 Voir le texte extrait par l&apos;OCR
                    </summary>
                    <div className="mt-2 p-2 bg-white/80 rounded text-xs text-green-900 font-mono max-h-32 overflow-y-auto border border-green-200">
                      <pre className="whitespace-pre-wrap break-words">{aiSuggestions.rawText.substring(0, 500)}</pre>
                      {aiSuggestions.rawText.length > 500 && (
                        <p className="text-green-600 mt-1">... (texte tronqué, voir console pour le texte complet)</p>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="expenseType" className="block text-sm font-semibold text-zinc-900">
          Type de dépense <span className="text-rose-600">*</span>
        </label>
        <select
          id="expenseType"
          value={formData.expenseType}
          onChange={(e) => handleInputChange('expenseType', e.target.value)}
          className="w-full p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-zinc-900 transition-all hover:border-zinc-300 shadow-sm"
          required
        >
          <option value="">Sélectionner un type</option>
          {[
            'Restaurant, Bar, Café',
            'Courses alimentaires',
            'Transport en commun',
            'Taxi, VTC',
            'Carburant, Péage',
            'Hôtel, Hébergement',
            'Médecin, Pharmacie',
            'Fournitures bureau',
            'Vêtements',
            'Abonnement services',
            'Loisirs, Culture',
            'Formation',
            'Frais bancaires',
            'Autres'
          ].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-semibold text-zinc-900">
          Date <span className="text-rose-600">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-zinc-900 transition-all hover:border-zinc-300 shadow-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="branch" className="block text-sm font-semibold text-zinc-900">
          Catégorie <span className="text-rose-600">*</span>
        </label>
        <select
          id="branch"
          value={formData.branch}
          onChange={(e) => handleInputChange('branch', e.target.value)}
          className="w-full p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-zinc-900 transition-all hover:border-zinc-300 shadow-sm"
          required
        >
          <option value="">Sélectionner une catégorie</option>
          {EXPENSE_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {formData.branch && (
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              {branchPersistStatus === 'saving' && (
                <span className="inline-flex items-center gap-1">
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sauvegarde…
                </span>
              )}
              {branchPersistStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircleIcon className="w-4 h-4" aria-hidden="true" /> Branche mémorisée
                </span>
              )}
              {branchPersistStatus === 'error' && (
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <ExclamationTriangleIcon className="w-4 h-4" aria-hidden="true" /> Erreur de sauvegarde
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-semibold text-zinc-900">
          Montant (€) <span className="text-rose-600">*</span>
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-zinc-900 transition-all hover:border-zinc-300 shadow-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold text-zinc-900">
          Description <span className="text-zinc-400 text-xs font-normal">(optionnel)</span>
        </label>
        <textarea
          id="description"
          placeholder="Description de la dépense..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border-2 border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white text-zinc-900 transition-all hover:border-zinc-300 shadow-sm"
        />
      </div>

      {/* Status messages */}
      {submitStatus.type && (
        <div className={`p-4 rounded-lg space-y-3 ${
          submitStatus.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <p className="text-sm flex items-start gap-2">
            {submitStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 flex-none" aria-hidden="true" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 flex-none" aria-hidden="true" />
            )}
            <span>{submitStatus.message}</span>
          </p>
          {submitStatus.type === 'success' && (
            <button
              type="button"
              onClick={handleNewNote}
              className="w-full p-3 rounded-lg font-medium bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <PlusCircleIcon className="w-5 h-5" aria-hidden="true" /> Nouvelle facture
              </span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {isFormValid && !submitStatus.type && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <p className="text-sm text-zinc-800">
              <span className="inline-flex items-center gap-2 font-medium">
                <PaperAirplaneIcon className="w-4 h-4" aria-hidden="true" /> Email sera envoyé à :
              </span><br />
              • Trésorerie : sgdf.tresolaguillotiere@gmail.com<br />
              • Vous : {userEmail}<br />
              <span className="inline-flex items-center gap-2 font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" x2="12" y1="5" y2="20"/></svg>
                Fichier :
              </span> {generateFileName()}
            </p>
          </div>
        )}

        {!isOnline && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" aria-hidden="true" />
            <span>Vous êtes hors ligne. Vous pouvez préparer la note mais l&apos;envoi ne fonctionnera qu&apos;une fois reconnecté.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting || !isOnline}
          className={`w-full p-4 rounded-xl font-semibold text-white transition-all focus:outline-none shadow-lg ${
            isFormValid && !isSubmitting && isOnline
              ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-zinc-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5" aria-hidden="true" /> Enregistrer la dépense
            </span>
          )}
        </button>
      </div>
    </form>
  )
}