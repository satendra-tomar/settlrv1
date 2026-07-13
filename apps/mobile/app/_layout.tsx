import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '../src/lib/supabase'
import { useAuthStore } from '../src/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

function AuthInitializer() {
  const { setSession, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Hydrate initial session from secure store
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        router.replace('/(tabs)')
      }
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (session) {
        router.replace('/(tabs)')
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading, router])

  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="coaching" />
        <Stack.Screen name="hostel" />
        <Stack.Screen name="review" />
      </Stack>
    </QueryClientProvider>
  )
}
