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
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'
import { BRANDING } from '../../src/constants/branding'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSendCode() {
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // shouldCreateUser: true — mobile app allows student self-registration
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a magic link to {email}. Click the link to securely sign in. You will be automatically redirected.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEmailSent(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Try another email</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome to {BRANDING.name}</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive a magic link to sign in.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={handleSendCode}
          returnKeyType="send"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  error: {
    color: '#EF4444',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
})
