import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type Amenity = Tables<'amenities'>

interface AmenityRowProps {
  amenity: Amenity
  onEdit: (a: Amenity) => void
  onDelete: (id: string) => void
}

function AmenityRow({ amenity, onEdit, onDelete }: AmenityRowProps) {
  return (
    <tr className="hover:bg-violet-surface transition-colors">
      <td className="px-4 py-3 font-medium text-ink">{amenity.name}</td>
      <td className="px-4 py-3 text-muted text-sm font-mono">
        {amenity.icon ?? '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(amenity)}
            className="p-1.5 rounded-lg text-muted hover:text-violet hover:bg-violet-surface transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(amenity.id)}
            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface EditAmenityRowProps {
  amenity: Amenity
  onSave: (id: string, values: { name: string; icon: string }) => void
  onCancel: () => void
}

function EditAmenityRow({ amenity, onSave, onCancel }: EditAmenityRowProps) {
  const [name, setName] = useState(amenity.name)
  const [icon, setIcon] = useState(amenity.icon ?? '')

  return (
    <tr className="bg-violet-surface">
      <td className="px-4 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1 border border-violet-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g. wifi"
          className="w-full px-2 py-1 border border-violet-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(amenity.id, { name, icon })}
            className="p-1.5 rounded-lg text-verified hover:bg-green-50 transition-colors"
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-muted hover:bg-gray-100 transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function AmenitiesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')

  const { data: amenities, isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as Amenity[]
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: { name: string; icon: string }
    }) => {
      const { error } = await supabase
        .from('amenities')
        .update({ name: values.name, icon: values.icon || null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      setEditingId(null)
      toast.success('Amenity updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('amenities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      toast.success('Amenity deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const addMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      const { error } = await supabase
        .from('amenities')
        .insert({ name: name.trim(), icon: icon.trim() || null })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      setShowAdd(false)
      setNewName('')
      setNewIcon('')
      toast.success('Amenity added')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function handleDelete(id: string) {
    if (window.confirm('Delete this amenity? This cannot be undone.')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg text-sm font-medium hover:bg-violet/90 transition-colors"
        >
          <Plus size={16} />
          Add Amenity
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-violet-border p-6 space-y-4">
          <h3 className="font-semibold text-ink">Add New Amenity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. WiFi"
                className="w-full px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Icon identifier
              </label>
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="e.g. wifi (lucide icon name)"
                className="w-full px-3 py-2 border border-violet-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
              />
              <p className="text-xs text-muted mt-1">Optional — used by the mobile app.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => addMutation.mutate({ name: newName, icon: newIcon })}
              disabled={!newName.trim() || addMutation.isPending}
              className="px-4 py-2 bg-violet text-white rounded-lg text-sm font-medium hover:bg-violet/90 disabled:opacity-60 transition-colors"
            >
              {addMutation.isPending ? 'Adding…' : 'Add Amenity'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-violet-border rounded-lg text-sm text-muted hover:bg-violet-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-violet-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-surface border-b border-violet-border">
              <th className="px-4 py-3 text-left font-semibold text-ink">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Icon</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-border">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-violet-border rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (amenities ?? []).length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No amenities yet.
                </td>
              </tr>
            ) : (
              (amenities ?? []).map((amenity) =>
                editingId === amenity.id ? (
                  <EditAmenityRow
                    key={amenity.id}
                    amenity={amenity}
                    onSave={(id, values) => updateMutation.mutate({ id, values })}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <AmenityRow
                    key={amenity.id}
                    amenity={amenity}
                    onEdit={(a) => setEditingId(a.id)}
                    onDelete={handleDelete}
                  />
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
