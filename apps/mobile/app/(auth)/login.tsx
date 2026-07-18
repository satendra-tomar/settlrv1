import React, { useState, useEffect } from 'react'
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
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/hooks/useAuth'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'
import { BRANDING, ASSETS } from '../../src/constants/branding'

type AuthState = 'idle' | 'sending' | 'waiting' | 'signing_in'

export default function LoginScreen() {
  const router = useRouter()
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>()
  const { loading, session } = useAuth()
  const [email, setEmail] = useState('')
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Watch for global auth loading state changes (e.g. deep link interception)
  useEffect(() => {
    if (loading && authState === 'waiting') {
      setAuthState('signing_in')
    }
  }, [loading, authState])

  // Countdown timer for resending
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  async function handleSendCode() {
    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }
    setAuthState('sending')
    setError(null)

    // Generate redirect URL to return to the app
    let redirectPath = '/(tabs)'
    if (returnUrl) {
      redirectPath = `/?returnUrl=${encodeURIComponent(returnUrl)}`
    }
    const redirectUrl = Linking.createURL(redirectPath)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    })

    if (otpError) {
      setError(otpError.message)
      setAuthState('idle')
      return
    }

    setAuthState('waiting')
    setCountdown(60) // 60 second delay before resend
  }

  function handleCancel() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)')
    }
  }

  const renderContent = () => {
    if (authState === 'signing_in') {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.violet} style={styles.spinner} />
          <Text style={styles.title}>Signing you in...</Text>
          <Text style={styles.subtitle}>Securing your session, please wait.</Text>
        </View>
      )
    }

    if (authState === 'waiting') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉️</Text>
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a secure magic link to{'\n'}
            <Text style={{ fontWeight: '700', color: colors.ink }}>{email}</Text>
          </Text>
          <Text style={styles.instructions}>
            Tap the link in your email to sign in instantly. You can safely switch apps, we'll wait here.
          </Text>

          <TouchableOpacity
            style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
            onPress={countdown === 0 ? handleSendCode : undefined}
            activeOpacity={0.7}
            disabled={countdown > 0}
          >
            <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
              {countdown > 0 ? `Resend link in ${countdown}s` : 'Resend Magic Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textButton} onPress={() => setAuthState('idle')}>
            <Text style={styles.textButtonText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.formContent}>
        <View style={styles.header}>
          <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome to {BRANDING.name}</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a magic link. No passwords required.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="student@example.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (error) setError(null)
            }}
            onSubmitEditing={handleSendCode}
            returnKeyType="send"
            editable={authState === 'idle'}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, authState === 'sending' && styles.primaryButtonDisabled]}
          onPress={handleSendCode}
          disabled={authState === 'sending'}
          activeOpacity={0.85}
        >
          {authState === 'sending' ? (
            <View style={styles.btnContent}>
              <ActivityIndicator color={colors.white} size="small" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Sending Link...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to {BRANDING.name}'s Terms of Service and Privacy Policy.
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inner}>{renderContent()}</View>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingBottom: 64,
  },
  formContent: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
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
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  instructions: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 40,
  },
  spinner: {
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  resendTextDisabled: {
    color: '#6B7280',
  },
  textButton: {
    padding: 12,
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
})

