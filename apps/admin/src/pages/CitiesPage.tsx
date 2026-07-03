import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type City = Tables<'cities'>

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface CityRowProps {
  city: City
  onEdit: (city: City) => void
  onDelete: (id: string) => void
}

function CityRow({ city, onEdit, onDelete }: CityRowProps) {
  return (
    <tr className="hover:bg-violet-surface transition-colors">
      <td className="px-4 py-3 font-medium text-ink">{city.name}</td>
      <td className="px-4 py-3 text-muted text-sm">{city.state}</td>
      <td className="px-4 py-3 text-muted text-xs font-mono">{city.name.toLowerCase()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(city)}
            className="p-1.5 rounded-lg text-muted hover:text-violet hover:bg-violet-surface transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(city.id)}
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

interface EditCityRowProps {
  city: City
  onSave: (id: string, values: { name: string; state: string }) => void
  onCancel: () => void
}

function EditCityRow({ city, onSave, onCancel }: EditCityRowProps) {
  const [name, setName] = useState(city.name)
  const [state, setState] = useState(city.state)

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
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-2 py-1 border border-violet-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet"
        />
      </td>
      <td className="px-4 py-2 text-muted text-xs font-mono">{slugify(name)}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(city.id, { name, state })}
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

export function CitiesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newState, setNewState] = useState('Madhya Pradesh')

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as City[]
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: { name: string; state: string }
    }) => {
      const { error } = await supabase
        .from('cities')
        .update({ name: values.name, state: values.state })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      setEditingId(null)
      toast.success('City updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      toast.success('City deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const addMutation = useMutation({
    mutationFn: async ({ name, state }: { name: string; state: string }) => {
      const { error } = await supabase
        .from('cities')
        .insert({ name: name.trim(), state: state.trim() })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      setShowAdd(false)
      setNewName('')
      setNewState('Madhya Pradesh')
      toast.success('City added')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function handleDelete(id: string) {
    if (window.confirm('Delete this city? This cannot be undone.')) {
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
          Add City
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-violet-border p-6 space-y-4">
          <h3 className="font-semibold text-ink">Add New City</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Indore"
                className="w-full px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
              {newName && (
                <p className="text-xs text-muted mt-1">
                  Slug: <code className="font-mono">{slugify(newName)}</code>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">State *</label>
              <input
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="e.g. Madhya Pradesh"
                className="w-full px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => addMutation.mutate({ name: newName, state: newState })}
              disabled={!newName.trim() || !newState.trim() || addMutation.isPending}
              className="px-4 py-2 bg-violet text-white rounded-lg text-sm font-medium hover:bg-violet/90 disabled:opacity-60 transition-colors"
            >
              {addMutation.isPending ? 'Adding…' : 'Add City'}
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
              <th className="px-4 py-3 text-left font-semibold text-ink">State</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-violet-border rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (cities ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No cities yet.
                </td>
              </tr>
            ) : (
              (cities ?? []).map((city) =>
                editingId === city.id ? (
                  <EditCityRow
                    key={city.id}
                    city={city}
                    onSave={(id, values) => updateMutation.mutate({ id, values })}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <CityRow
                    key={city.id}
                    city={city}
                    onEdit={(c) => setEditingId(c.id)}
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
