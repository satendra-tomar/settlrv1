import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/hooks/useAuth'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'
import { BRANDING, ASSETS } from '../../src/constants/branding'

export default function SetupProfileScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSaveProfile() {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!user) return

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', user.id)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    // Show welcome message briefly, then redirect
    setTimeout(() => {
      router.replace('/(tabs)')
    }, 1500)
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.titleCenter}>Welcome to {BRANDING.name}, {name.split(' ')[0]}!</Text>
          <Text style={styles.subtitleCenter}>Let's find your perfect place.</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to {BRANDING.name}</Text>
            <Text style={styles.subtitle}>
              What should we call you?
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="e.g. Rahul Kumar"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              autoCorrect={false}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (error) setError(null)
              }}
              onSubmitEditing={handleSaveProfile}
              returnKeyType="done"
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingBottom: 64,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'left',
  },
  titleCenter: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
  },
  subtitleCenter: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: radius.md,
    padding: 16,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
})
