import { Stack } from 'expo-router'
import { colors } from '../../src/lib/tokens'

export default function ReviewLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.violet,
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
      }}
    >
      <Stack.Screen name="write" />
    </Stack>
  )
}
