import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../lib/tokens'

interface EmptyStateProps {
  title: string
  subtitle: string
  action?: { label: string; onPress: () => void }
  light?: boolean
}

export function EmptyState({ title, subtitle, action, light = false }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: light ? colors.white : colors.ink }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: light ? colors.darkMuted : colors.muted }]}>{subtitle}</Text>
      {action && (
        <TouchableOpacity style={styles.button} onPress={action.onPress} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})
