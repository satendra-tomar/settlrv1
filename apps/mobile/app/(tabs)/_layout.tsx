import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useFavorites } from '../../src/hooks/useFavorites'
import { useAuth } from '../../src/hooks/useAuth'
import { colors, fontSize } from '../../src/lib/tokens'

export default function TabsLayout() {
  const { user } = useAuth()
  const { data: favorites } = useFavorites(user?.id ?? null)
  const favoriteCount = favorites?.length ?? 0

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🏠" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🔍" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🤍" color={color} />
          ),
          tabBarBadge: favoriteCount > 0 && user ? favoriteCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="👤" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: any }) {
  // Using Text with emoji instead of a vector icon package (Phase 4 can replace)
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>
}

