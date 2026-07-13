import { Stack } from 'expo-router'
import { colors } from '../../src/lib/tokens'

export default function HostelLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.violet,
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  )
}
