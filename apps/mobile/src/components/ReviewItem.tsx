import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../lib/tokens'
import { RatingStars } from './RatingStars'

interface ReviewItemProps {
  review: {
    rating: number
    body: string | null
    created_at: string
    profiles: { full_name: string | null } | null
  }
}

/** Simple relative date — no date library dependency. */
function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export function ReviewItem({ review }: ReviewItemProps) {
  const name = review.profiles?.full_name ?? 'Anonymous'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.date}>{relativeDate(review.created_at)}</Text>
        </View>
        <RatingStars rating={review.rating} size="sm" />
      </View>
      {review.body ? (
        <Text style={styles.body}>{review.body}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.ink,
    lineHeight: 20,
  },
})
