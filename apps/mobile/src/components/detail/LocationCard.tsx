import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import * as Linking from 'expo-linking'
import { colors, radius, spacing, fontSize } from '../../lib/tokens'

interface LocationCardProps {
  area: string | null
  name: string
}

export function LocationCard({ area, name }: LocationCardProps) {
  if (!area) return null

  function handleDirections() {
    const query = encodeURIComponent(`${name}, ${area}`)
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.emoji}>📍</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Location</Text>
        <Text style={styles.area}>{area}</Text>
        <TouchableOpacity style={styles.btn} onPress={handleDirections} activeOpacity={0.8}>
          <Text style={styles.btnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  mapPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emoji: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.darkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  area: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  btnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.violetLight,
  },
})
