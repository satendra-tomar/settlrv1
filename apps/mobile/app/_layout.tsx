import { useEffect, useRef } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
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
  const segments = useSegments()
  
  // Keep track of the target route we want to return to if interrupted by auth
  const targetRoute = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const handleUrl = async (url: string | null) => {
      if (!url) return
      const parsed = Linking.parse(url)
      const queryParams = parsed.queryParams
      const path = parsed.path
      
      // If there's a returnUrl, save it. Otherwise keep track of path if it's not auth
      if (queryParams?.returnUrl && typeof queryParams.returnUrl === 'string') {
        targetRoute.current = queryParams.returnUrl
      } else if (path && !path.includes('auth')) {
        // Fallback for returning to the exact path linked to
        targetRoute.current = `/${path}`
      }

      // Handle Magic Link token
      if (queryParams?.access_token && queryParams?.refresh_token) {
        setLoading(true)
        await supabase.auth.setSession({
          access_token: queryParams.access_token as string,
          refresh_token: queryParams.refresh_token as string,
        })
      }
    }

    // 1. Check initial deep link
    Linking.getInitialURL().then(handleUrl)

    // 2. Listen for deep links while app is open
    const sub = Linking.addEventListener('url', (event) => handleUrl(event.url))

    const checkProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
      if (!isMounted) return
      
      if (!data?.full_name) {
        // Needs onboarding
        router.replace('/(auth)/setup-profile')
      } else {
        // Profile is complete. Return to what they were doing or dismiss modal.
        if (targetRoute.current) {
          router.replace(targetRoute.current as any)
          targetRoute.current = null
        } else if (segments[0] === '(auth)') {
          // If stuck in auth, go back or home
          if (router.canGoBack()) {
            router.back()
          } else {
            router.replace('/(tabs)')
          }
        }
      }
    }

    // 3. Hydrate initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setSession(session)
      if (session) {
        checkProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // 4. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      setSession(session)
      
      if (event === 'SIGNED_IN' && session) {
        checkProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setLoading(false)
        // Ensure we don't aggressively redirect to login on sign out, we just stay where we are as guests
      } else if (event === 'INITIAL_SESSION') {
         // handled by getSession already or here if needed, but getSession covers it
      }
    })

    return () => {
      isMounted = false
      sub.remove()
      subscription.unsubscribe()
    }
  }, [setSession, setLoading])

  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth flow presented as a modal so it can overlay on top of any screen */}
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="coaching" />
        <Stack.Screen name="hostel" />
        <Stack.Screen name="review" />
      </Stack>
    </QueryClientProvider>
  )
}

