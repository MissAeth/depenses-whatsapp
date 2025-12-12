'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserGroupIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  phone: string
  email?: string
  name?: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  last_login?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Formulaire de création/édition
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()

      if (res.status === 401) {
        // Non authentifié, rediriger vers login
        router.push('/admin/login')
        return
      }

      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erreur chargement users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setShowCreateModal(false)
        setFormData({ phone: '', name: '', email: '', role: 'user' })
        loadUsers()
        alert('✅ Utilisateur créé avec succès !')
      } else {
        alert('❌ Erreur : ' + (data.error || 'Échec de la création'))
      }
    } catch (error) {
      alert('❌ Erreur réseau')
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await res.json()

      if (data.success) {
        loadUsers()
        setEditingUser(null)
        alert('✅ Utilisateur mis à jour !')
      } else {
        alert('❌ Erreur : ' + (data.error || 'Échec de la mise à jour'))
      }
    } catch (error) {
      alert('❌ Erreur réseau')
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver ${userName || 'cet utilisateur'} ?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        loadUsers()
        alert('✅ Utilisateur désactivé !')
      } else {
        alert('❌ Erreur : ' + (data.error || 'Échec de la suppression'))
      }
    } catch (error) {
      alert('❌ Erreur réseau')
    }
  }

  const handleLogout = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Erreur logout:', error)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    inactive: users.filter(u => !u.is_active).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-zinc-900" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-zinc-900" />
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Dashboard Admin</h1>
              <p className="text-sm text-zinc-600">Gestion des utilisateurs SGDF</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total utilisateurs" value={stats.total} icon="👥" />
          <StatCard title="Actifs" value={stats.active} icon="✅" color="green" />
          <StatCard title="Administrateurs" value={stats.admins} icon="🛡️" color="blue" />
          <StatCard title="Inactifs" value={stats.inactive} icon="⏸️" color="gray" />
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900">Utilisateurs</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Créer un utilisateur
          </button>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase">Dernière connexion</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm text-zinc-900">{user.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-700">{user.phone}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{user.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircleIcon className="w-4 h-4" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <XCircleIcon className="w-4 h-4" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.phone)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Désactiver"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de création */}
      {showCreateModal && (
        <Modal
          title="Créer un utilisateur"
          onClose={() => {
            setShowCreateModal(false)
            setFormData({ phone: '', name: '', email: '', role: 'user' })
          }}
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded"
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-zinc-300 rounded"
                placeholder="jean@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                className="w-full p-2 border border-zinc-300 rounded"
              >
                <option value="user">👤 Utilisateur</option>
                <option value="admin">🛡️ Administrateur</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ phone: '', name: '', email: '', role: 'user' })
                }}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                Créer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal d'édition */}
      {editingUser && (
        <Modal
          title="Modifier l'utilisateur"
          onClose={() => setEditingUser(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                defaultValue={editingUser.name}
                onBlur={(e) => {
                  if (e.target.value !== editingUser.name) {
                    handleUpdateUser(editingUser.id, { name: e.target.value })
                  }
                }}
                className="w-full p-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={editingUser.email}
                onBlur={(e) => {
                  if (e.target.value !== editingUser.email) {
                    handleUpdateUser(editingUser.id, { email: e.target.value })
                  }
                }}
                className="w-full p-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Rôle
              </label>
              <select
                defaultValue={editingUser.role}
                onChange={(e) => {
                  handleUpdateUser(editingUser.id, { role: e.target.value as 'user' | 'admin' })
                }}
                className="w-full p-2 border border-zinc-300 rounded"
              >
                <option value="user">👤 Utilisateur</option>
                <option value="admin">🛡️ Administrateur</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={editingUser.is_active}
                  onChange={(e) => {
                    handleUpdateUser(editingUser.id, { is_active: e.target.checked })
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-700">Compte actif</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Composant StatCard
function StatCard({ title, value, icon, color = 'zinc' }: { title: string; value: number; icon: string; color?: string }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    zinc: 'bg-zinc-50 border-zinc-200 text-zinc-900'
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium">{title}</p>
    </div>
  )
}

// Composant Modal
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
