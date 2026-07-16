import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { supabase } from '../../src/lib/supabase'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [fullName, setFullName] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoadingProfile(true)
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setFullName(data?.full_name ?? null)
        setLoadingProfile(false)
      })
  }, [user])

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={styles.placeholderName}>Guest</Text>
          <Text style={styles.placeholderEmail}>Not signed in</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(fullName ?? user.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        {loadingProfile ? (
          <ActivityIndicator color={colors.violet} style={{ marginBottom: spacing.sm }} />
        ) : (
          <Text style={styles.name}>{fullName ?? 'Student'}</Text>
        )}

        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            await signOut()
            router.replace('/(tabs)')
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: 36,
    color: colors.white,
    fontWeight: '700',
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  placeholderName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  placeholderEmail: {
    fontSize: fontSize.md,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  signOutButton: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
})
