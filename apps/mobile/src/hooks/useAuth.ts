import { create } from 'zustand'

type AuthState = {
  user: import('@supabase/supabase-js').User | null
  session: import('@supabase/supabase-js').Session | null
  loading: boolean
  setUser: (user: import('@supabase/supabase-js').User | null) => void
  setSession: (session: import('@supabase/supabase-js').Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

import { supabase } from '../lib/supabase'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))

/**
 * useAuth — convenience hook that reads from the zustand auth store.
 * Use this in all components instead of accessing the store directly.
 */
export function useAuth() {
  const { user, session, loading, signOut } = useAuthStore()
  return { user, session, loading, signOut }
}
