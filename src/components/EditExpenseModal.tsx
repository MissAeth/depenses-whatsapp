'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Expense } from './WhatsappExpensesPanel'

type EditExpenseModalProps = {
  expense: Expense
  onClose: () => void
  onSave: (updated: Expense) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
}

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

export default function EditExpenseModal({ expense, onClose, onSave, onDelete }: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: expense.amount.toString(),
    merchant: expense.merchant,
    description: expense.description || '',
    category: expense.category || '',
    status: expense.status || 'brouillon',
    received_at: expense.received_at ? new Date(expense.received_at).toISOString().split('T')[0] : ''
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated: Expense = {
        ...expense,
        amount: parseFloat(formData.amount) || 0,
        merchant: formData.merchant,
        description: formData.description,
        category: formData.category || null,
        status: formData.status as 'brouillon' | 'validee' | 'rejetee',
        received_at: formData.received_at ? new Date(formData.received_at).toISOString() : expense.received_at
      }
      onSave(updated)
    } catch (e) {
      console.error('Erreur sauvegarde:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      onDelete(expense.id)
    } catch (e) {
      console.error('Erreur suppression:', e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 pt-8 md:pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">Modifier la dépense</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Montant (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Marchand */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Marchand
            </label>
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">-- Sélectionner --</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'brouillon' | 'validee' | 'rejetee' })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="brouillon">📝 Brouillon</option>
              <option value="validee">✓ Validée</option>
              <option value="rejetee">✗ Rejetée</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Date de réception
            </label>
            <input
              type="date"
              value={formData.received_at}
              onChange={(e) => setFormData({ ...formData, received_at: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Info confiance IA */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Confiance IA : <strong>{Math.round((expense.confidence || 0) * 100)}%</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-50 border-t border-zinc-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-red-700 hover:text-red-900 border border-red-300 hover:border-red-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Confirmation suppression */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
