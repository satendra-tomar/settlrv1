import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { useMyReview, useSubmitReview } from '../../../src/hooks/useReviews'
import { colors, spacing, fontSize, radius } from '../../../src/lib/tokens'

export default function WriteReviewScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const { data: existingReview, isLoading: loadingExisting } = useMyReview(
    listingId,
    user?.id ?? null,
  )
  const submitReview = useSubmitReview()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingError, setRatingError] = useState(false)

  // Pre-fill if editing existing review
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.body ?? '')
    }
  }, [existingReview])

  const isEditing = Boolean(existingReview)
  const screenTitle = isEditing ? 'Edit Your Review' : 'Write a Review'

  async function handleSubmit() {
    if (rating === 0) {
      setRatingError(true)
      return
    }
    if (!user) return

    setRatingError(false)
    await submitReview.mutateAsync({
      listingId,
      userId: user.id,
      rating,
      body: comment,
      existingReviewId: existingReview?.id,
    })

    router.back()
  }

  if (loadingExisting) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.violet} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: screenTitle }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Star rating selector */}
        <Text style={styles.label}>Your rating *</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => {
                setRating(star)
                setRatingError(false)
              }}
              activeOpacity={0.7}
              style={styles.starTouch}
            >
              <Text style={[styles.starIcon, star <= rating ? styles.starFilled : styles.starEmpty]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {ratingError && (
          <Text style={styles.error}>Please select a star rating before submitting.</Text>
        )}

        {/* Comment */}
        <Text style={styles.label}>Your experience (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={comment}
          onChangeText={setComment}
          maxLength={1000}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, submitReview.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitReview.isPending}
          activeOpacity={0.85}
        >
          {submitReview.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>
              {isEditing ? 'Update Review' : 'Submit Review'}
            </Text>
          )}
        </TouchableOpacity>

        {submitReview.error ? (
          <Text style={styles.error}>
            {(submitReview.error as Error).message}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  starTouch: {
    padding: spacing.xs,
  },
  starIcon: {
    fontSize: 40,
  },
  starFilled: {
    color: colors.star,
  },
  starEmpty: {
    color: colors.border,
  },
  error: {
    color: '#EF4444',
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    backgroundColor: colors.white,
    height: 130,
    marginBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
})
