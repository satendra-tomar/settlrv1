import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { usePendingActionStore } from '../store/pendingActionStore'
import { colors, spacing, fontSize, radius } from '../lib/tokens'

interface AuthPromptModalProps {
  visible: boolean
  reason: string
  onClose: () => void
  pendingAction?: () => void
}

export function AuthPromptModal({
  visible,
  reason,
  onClose,
  pendingAction,
}: AuthPromptModalProps) {
  const router = useRouter()
  const setPendingAction = usePendingActionStore((s) => s.setPendingAction)

  function handleLogin() {
    if (pendingAction) {
      setPendingAction(pendingAction)
    }
    onClose()
    router.push('/(auth)/login')
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.reason}>{reason}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xl + 16, // extra for safe area
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  reason: {
    fontSize: fontSize.md,
    color: colors.ink,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
})
