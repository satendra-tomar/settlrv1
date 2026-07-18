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
  Switch,
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
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [ratingError, setRatingError] = useState(false)

  // Validation lengths
  const MIN_COMMENT_LENGTH = 10
  const MAX_COMMENT_LENGTH = 1000

  // Pre-fill if editing existing review
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setTitle(existingReview.title ?? '')
      setComment(existingReview.body ?? '')
      setIsAnonymous(existingReview.is_anonymous ?? false)
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
      title: title.trim() || null,
      body: comment.trim() || null,
      isAnonymous,
      recommend: rating >= 4, // Simple heuristic for now
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

        {/* Title */}
        <Text style={styles.label}>Title (optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Sum up your experience in a few words"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Comment */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Your experience (optional)</Text>
          <Text style={styles.charCount}>
            {comment.length} / {MAX_COMMENT_LENGTH}
          </Text>
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Share details about your experience..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={comment}
          onChangeText={setComment}
          maxLength={MAX_COMMENT_LENGTH}
        />
        {comment.length > 0 && comment.length < MIN_COMMENT_LENGTH && (
          <Text style={styles.errorText}>Please write at least {MIN_COMMENT_LENGTH} characters.</Text>
        )}

        {/* Anonymous Toggle */}
        <View style={styles.anonymousRow}>
          <View style={styles.anonymousTextCol}>
            <Text style={styles.anonymousTitle}>Post Anonymously</Text>
            <Text style={styles.anonymousSub}>Hide your name from public view</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: colors.darkBorder, true: colors.violet }}
            thumbColor={colors.white}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, (submitReview.isPending || (comment.length > 0 && comment.length < MIN_COMMENT_LENGTH)) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitReview.isPending || (comment.length > 0 && comment.length < MIN_COMMENT_LENGTH)}
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
  errorText: {
    color: '#EF4444',
    fontSize: fontSize.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
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
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  anonymousTextCol: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.ink,
  },
  anonymousSub: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
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
