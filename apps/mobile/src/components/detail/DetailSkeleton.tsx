import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { colors, radius, spacing } from '../../lib/tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function DetailSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity }}>
          {/* Hero Skeleton */}
          <View style={styles.heroImage} />
          
          <View style={styles.content}>
            {/* Title & Badges Skeleton */}
            <View style={styles.heroRow}>
              <View style={styles.logoBox} />
              <View style={{ flex: 1, gap: spacing.sm }}>
                <View style={[styles.line, { width: '80%', height: 28 }]} />
                <View style={[styles.line, { width: '40%' }]} />
              </View>
            </View>
            <View style={styles.badgesRow}>
              <View style={[styles.line, { width: 80, height: 24, borderRadius: radius.full }]} />
              <View style={[styles.line, { width: 60, height: 24, borderRadius: radius.full }]} />
            </View>

            {/* Section Skeletons */}
            {Array(3).fill(null).map((_, i) => (
              <View key={i} style={styles.section}>
                <View style={[styles.line, { width: 140, height: 20, marginBottom: spacing.md }]} />
                <View style={styles.card}>
                  <View style={[styles.line, { width: '100%', marginBottom: spacing.sm }]} />
                  <View style={[styles.line, { width: '90%', marginBottom: spacing.sm }]} />
                  <View style={[styles.line, { width: '60%' }]} />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 340,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    padding: spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: 48,
  },
  section: {
    marginBottom: 56,
  },
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  line: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.sm,
  },
})
