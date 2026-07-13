import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../lib/tokens'

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Image placeholder */}
      <View style={styles.image} />
      {/* Content placeholders */}
      <View style={styles.content}>
        <View style={[styles.line, styles.lineLong]} />
        <View style={[styles.line, styles.lineShort]} />
        <View style={styles.lineRow}>
          <View style={[styles.line, styles.lineChip]} />
          <View style={[styles.line, styles.lineChip]} />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
  lineLong: {
    width: '75%',
  },
  lineShort: {
    width: '45%',
  },
  lineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  lineChip: {
    width: 60,
    height: 22,
    borderRadius: radius.full,
  },
})
