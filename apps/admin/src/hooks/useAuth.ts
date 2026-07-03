import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Enums } from '../types/database'

type Role = Enums<'user_role'> | null

interface UseAuthReturn {
  user: User | null
  role: Role
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('useAuth: failed to fetch profile role', error)
      setRole(null)
    } else {
      setRole(data.role)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRole(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchRole(session.user.id)
        } else {
          setRole(null)
        }
        setLoading(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchRole])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }, [])

  return { user, role, loading, signOut }
}
