import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { colors, spacing, fontSize, radius } from '../lib/tokens'
import { RatingStars } from './RatingStars'
import type { ReviewItem as ReviewItemType } from '../hooks/useReviews'
import { useAuth } from '../hooks/useAuth'
import { useToggleHelpful } from '../hooks/useReviews'

interface ReviewItemProps {
  review: ReviewItemType
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
  const { user } = useAuth()
  const toggleHelpful = useToggleHelpful()
  
  // Local state for optimistic updates
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)
  const [isHelpfulLocal, setIsHelpfulLocal] = useState(false) // Assuming false initially without backend tracking per user

  const name = review.is_anonymous 
    ? 'Anonymous' 
    : review.profiles?.full_name ?? 'Anonymous'

  const handleHelpfulPress = () => {
    if (!user) return // Should prompt login in real app
    
    const newValue = !isHelpfulLocal
    setIsHelpfulLocal(newValue)
    setHelpfulCount((prev) => newValue ? prev + 1 : prev - 1)
    
    toggleHelpful.mutate({
      reviewId: review.id,
      userId: user.id,
      isHelpful: newValue,
    })
  }

  const handleReportPress = () => {
    // Basic mock report alert
    Alert.alert(
      "Report Review",
      "Why are you reporting this review?",
      [
        { text: "Spam", onPress: () => console.log('Reported Spam') },
        { text: "Abusive", onPress: () => console.log('Reported Abusive') },
        { text: "Fake", onPress: () => console.log('Reported Fake') },
        { text: "Cancel", style: "cancel" }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {review.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{relativeDate(review.created_at)}</Text>
        </View>
        <RatingStars rating={review.rating} size="sm" />
      </View>
      
      {review.title ? (
        <Text style={styles.title}>{review.title}</Text>
      ) : null}

      {review.body ? (
        <Text style={styles.body}>{review.body}</Text>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={handleHelpfulPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, isHelpfulLocal && styles.actionIconActive]}>👍</Text>
          <Text style={[styles.actionText, isHelpfulLocal && styles.actionTextActive]}>
            Helpful ({helpfulCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={handleReportPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>🚩</Text>
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  verifiedText: {
    color: colors.emerald,
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.darkMuted,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.darkBorder,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  actionIcon: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionIconActive: {
    opacity: 1,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
  },
  actionTextActive: {
    color: colors.violetLight,
  },
})
