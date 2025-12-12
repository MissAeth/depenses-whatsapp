'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ClipboardDocumentListIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusCircleIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { processExpenseContent, type ExtractedExpenseData } from '@/lib/ai-processor-unified'

interface ExpenseFormProps {
  readonly capturedImage: string | null
  readonly userEmail: string
  readonly initialBranch?: string // From Clerk public metadata
  readonly onPersistBranch?: (branch: string) => Promise<void> | void
  readonly onCreateNewNote?: () => void
  readonly onBranchChange?: (branch: string) => void
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

// Synonymes pour normaliser la catégorie IA vers notre liste
const CATEGORY_SYNONYMS: Record<string, string> = {
  'restaurant': 'Restauration',
  'restauration': 'Restauration',
  'resto': 'Restauration',
  'bar': 'Restauration',
  'café': 'Restauration',
  'cafe': 'Restauration',
  'boulangerie': 'Restauration',
  'fastfood': 'Restauration',
  'transport': 'Transport',
  'taxi': 'Transport',
  'vtc': 'Transport',
  'uber': 'Transport',
  'metro': 'Transport',
  'bus': 'Transport',
  'train': 'Transport',
  'sncf': 'Transport',
  'carburant': 'Transport',
  'essence': 'Transport',
  'parking': 'Transport',
  'hotel': 'Hébergement',
  'hôtel': 'Hébergement',
  'hébergement': 'Hébergement',
  'hebergement': 'Hébergement',
  'airbnb': 'Hébergement',
  'booking': 'Hébergement',
  'fournitures': 'Fournitures',
  'bureau': 'Fournitures',
  'papeterie': 'Fournitures',
  'santé': 'Santé',
  'sante': 'Santé',
  'pharmacie': 'Santé',
  'médecin': 'Santé',
  'medecin': 'Santé',
  'docteur': 'Santé',
  'loisirs': 'Loisirs',
  'cinema': 'Loisirs',
  'cinéma': 'Loisirs',
  'culture': 'Loisirs',
}

function normalizeCategory(input?: string): string {
  if (!input) return ''
  const key = input.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const mapped = CATEGORY_SYNONYMS[key]
  if (mapped && EXPENSE_CATEGORIES.includes(mapped)) return mapped
  // Essai fuzzy simple: si contient un mot clé connu
  for (const [syn, target] of Object.entries(CATEGORY_SYNONYMS)) {
    if (key.includes(syn) && EXPENSE_CATEGORIES.includes(target)) return target
  }
  return ''
}

// Suggestion de type de dépense (expenseType) à partir des infos IA
function suggestExpenseType(ai: ExtractedExpenseData): string {
  const source = `${ai.merchant || ''} ${ai.description || ''}`.toLowerCase()
  const map: Array<{ keywords: string[]; type: string }> = [
    { keywords: ['restaurant','resto','bar','cafe','pizza','boulangerie'], type: 'Restaurant, Bar, Café' },
    { keywords: ['course','courses','supermarche','supermarché','carrefour','monoprix','auchan','intermarche'], type: 'Courses alimentaires' },
    { keywords: ['taxi','uber','bolt','vtc','metro','bus','rer','tram','sncf','train'], type: 'Transport en commun' },
    { keywords: ['hotel','hôtel','airbnb','booking','nuit','chambre'], type: 'Hôtel, Hébergement' },
    { keywords: ['pharmacie','medecin','médecin','docteur','clinique'], type: 'Médecin, Pharmacie' },
    { keywords: ['fourniture','bureau','papeterie'], type: 'Fournitures bureau' },
    { keywords: ['abonnement','subscription','monthly'], type: 'Abonnement services' },
    { keywords: ['cinema','cinéma','loisir','culture','spectacle','musée','musee'], type: 'Loisirs, Culture' },
    { keywords: ['peage','péage','essence','carburant','station'], type: 'Carburant, Péage' },
    { keywords: ['vetement','vêtement','zara','hm','uniqlo'], type: 'Vêtements' },
  ]
  for (const rule of map) {
    if (rule.keywords.some(k => source.includes(k))) return rule.type
  }
  // fallback
  return ai.description || ''
}

export function ExpenseForm({ capturedImage, userEmail, initialBranch = '', onPersistBranch, onCreateNewNote, onBranchChange, isOnline = true }: ExpenseFormProps & { isOnline?: boolean }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    branch: initialBranch || '',
    expenseType: '',
    amount: '',
    description: ''
  })
  const [branchPersistStatus, setBranchPersistStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<ExtractedExpenseData | null>(null)

  // Duplicate detection state
  const [duplicateCheck, setDuplicateCheck] = useState<{
    checking: boolean
    isDuplicate: boolean
    duplicates: Array<{
      id: string
      amount: number
      merchant: string
      description: string
      received_at: string
      similarity: number
    }>
  }>({
    checking: false,
    isDuplicate: false,
    duplicates: []
  })
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

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
  }, [capturedImage]) // Fermeture correcte du useEffect

  const processImageWithAI = async () => {
    console.log('🎯 processImageWithAI appelé - capturedImage:', !!capturedImage)
    
    if (!capturedImage) {
      console.log('❌ Pas d\'image capturée, arrêt du traitement')
      return
    }

    console.log('🚀 Démarrage traitement IA...')
    setAiProcessing(true)
    
    // Reset du formulaire avant nouveau traitement
    setFormData(prev => ({
      ...prev,
      amount: '',
      expenseType: '',
      description: ''
    }))

    try {
      console.log('🤖 Appel processExpenseContent avec image...')
      const extractedData = await processExpenseContent(capturedImage)
      console.log('✅ Données extraites par IA:', extractedData)
      
      console.log('💾 Sauvegarde des suggestions IA...')
      setAiSuggestions(extractedData)
      
      console.log('📝 Auto-remplissage du formulaire...')
      // Auto-remplir le formulaire avec les nouvelles suggestions IA
      // Mapping IA -> Form:
      // - branch: catégorie suggérée par l'IA si elle est dans notre liste, sinon vide
      // - expenseType: type suggéré si pertinent, sinon vide
      const normalizedCategory = normalizeCategory(extractedData.category)
      const matchedType = suggestExpenseType(extractedData)

      setFormData(prev => ({
        ...prev,
        amount: extractedData.amount > 0 ? extractedData.amount.toString() : '',
        branch: normalizedCategory,
        expenseType: matchedType,
        description: `${extractedData.merchant || ''}${extractedData.description ? ' - ' + extractedData.description : ''}`.trim()
      }))
      
      console.log('✨ Traitement IA terminé avec succès')
    } catch (error) {
      console.error('❌ Erreur traitement IA:', error)
      setAiSuggestions(null)
    } finally {
      console.log('🏁 Fin du traitement IA')
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

  const checkForDuplicates = async () => {
    if (!formData.amount || !formData.description || !formData.date) {
      return
    }

    setDuplicateCheck(prev => ({ ...prev, checking: true }))

    try {
      // Extraire le marchand de la description
      const merchant = formData.description.split(' - ')[0].trim() || 'Marchand inconnu'

      const response = await fetch('/api/expenses/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formatAmount(formData.amount),
          merchant,
          date: formData.date,
          whatsapp_from: userEmail
        })
      })

      const result = await response.json()

      if (response.ok && result.isDuplicate) {
        setDuplicateCheck({
          checking: false,
          isDuplicate: true,
          duplicates: result.duplicates
        })
        setShowDuplicateModal(true)
        return true // Doublon détecté
      } else {
        setDuplicateCheck({
          checking: false,
          isDuplicate: false,
          duplicates: []
        })
        return false // Pas de doublon
      }
    } catch (error) {
      console.error('Erreur vérification doublons:', error)
      setDuplicateCheck({
        checking: false,
        isDuplicate: false,
        duplicates: []
      })
      return false // En cas d'erreur, continuer quand même
    }
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

    // Vérifier les doublons avant d'enregistrer
    const hasDuplicate = await checkForDuplicates()
    if (hasDuplicate) {
      // Le modal de confirmation s'affichera, l'utilisateur devra confirmer
      return
    }

    // Continuer avec l'enregistrement
    await saveExpense()
  }

  const saveExpense = async () => {
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
        // Reset duplicate check
        setDuplicateCheck({
          checking: false,
          isDuplicate: false,
          duplicates: []
        })
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
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-5 h-5 text-zinc-700" aria-hidden="true" />
        Informations de la dépense
      </h2>

      {capturedImage && (
        <div className="space-y-2">
          <label htmlFor="image-preview" className="block text-sm font-medium text-zinc-700">
            Aperçu du justificatif
          </label>
          <Image
            id="image-preview"
            src={capturedImage}
            alt="Justificatif"
            width={500}
            height={200}
            className="w-full h-48 object-cover rounded-lg border border-zinc-200"
          />
          
          {/* Statut du traitement IA */}
          {aiProcessing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-800">Analyse en cours avec l'IA...</span>
                <span className="text-xs text-blue-600">OCR + Extraction des données</span>
              </div>
            </div>
          )}
          
          {aiSuggestions && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <SparklesIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-green-800">Données extraites par l'IA</h4>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔄 Force nouveau traitement IA...')
                        processImageWithAI()
                      }}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      Retraiter
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    <p><strong>Montant:</strong> {aiSuggestions.amount}€</p>
                    <p><strong>Marchand:</strong> {aiSuggestions.merchant}</p>
                    <p><strong>Catégorie:</strong> {aiSuggestions.category}</p>
                    <p><strong>Confiance:</strong> {Math.round(aiSuggestions.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="expenseType" className="block text-sm font-medium text-zinc-700">
          Type de dépense *
        </label>
        <select
          id="expenseType"
          value={formData.expenseType}
          onChange={(e) => handleInputChange('expenseType', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
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
        <label htmlFor="date" className="block text-sm font-medium text-zinc-700">
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="branch" className="block text-sm font-medium text-zinc-700">
          Catégorie *
        </label>
        <select
          id="branch"
          value={formData.branch}
          onChange={(e) => handleInputChange('branch', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
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
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-700">
          Montant (€) *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          placeholder="Description de la dépense..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none bg-white text-zinc-900"
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
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors focus:outline-none ${
            isFormValid && !isSubmitting && isOnline
              ? 'bg-zinc-900 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-400'
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

    {/* Modal de confirmation de doublon */}
    {showDuplicateModal && duplicateCheck.isDuplicate && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              ⚠️ Doublon potentiel détecté
            </h3>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <p className="text-sm text-zinc-700 mb-4">
              Nous avons trouvé {duplicateCheck.duplicates.length} dépense{duplicateCheck.duplicates.length > 1 ? 's' : ''} similaire{duplicateCheck.duplicates.length > 1 ? 's' : ''} pour le même jour :
            </p>
            
            <div className="space-y-3 mb-6">
              {duplicateCheck.duplicates.map((dup) => (
                <div key={dup.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-900">{dup.amount}€</span>
                        <span className="text-sm text-zinc-600">· {dup.merchant}</span>
                      </div>
                      <p className="text-sm text-zinc-600">{dup.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Reçu le {new Date(dup.received_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                        {dup.similarity}% similaire
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Votre nouvelle dépense :</strong>
              </p>
              <div className="mt-2 text-sm text-blue-800">
                <p>• Montant : {formData.amount}€</p>
                <p>• Description : {formData.description}</p>
                <p>• Date : {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDuplicateModal(false)
                setDuplicateCheck({
                  checking: false,
                  isDuplicate: false,
                  duplicates: []
                })
              }}
              className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowDuplicateModal(false)
                await saveExpense()
              }}
              className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
            >
              Enregistrer quand même
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}