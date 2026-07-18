import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ImageGallery } from '../ImageGallery'
import { RatingStars } from '../RatingStars'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ListingHeroProps {
  images: { url: string; is_primary: boolean }[]
  name: string
  area: string | null
  rating: number
  reviewCount: number
  isVerified: boolean
  updatedAt: string
  viewsCount: number
  savesCount: number
  contactsCount: number
  settlrScore?: number
  isFavorited: boolean
  onFavoritePress: () => void
}

function ListingHeroComponent({
  images,
  name,
  area,
  rating,
  reviewCount,
  isVerified,
  updatedAt,
  viewsCount,
  savesCount,
  contactsCount,
  settlrScore,
  isFavorited,
  onFavoritePress,
}: ListingHeroProps) {
  const hasMultipleImages = images.length > 1
  const primaryImage = images.find((img) => img.is_primary) ?? images[0]
  const heroUrl = primaryImage?.url ?? null

  return (
    <View style={styles.container}>
      {/* Image area */}
      {hasMultipleImages ? (
        <ImageGallery images={images} height={340} />
      ) : heroUrl ? (
        <Image
          source={{ uri: heroUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.heroImage, styles.placeholder]} />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(15,11,24,0.7)', colors.dark]}
        locations={[0.5, 0.85, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Top action buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={onFavoritePress}
          activeOpacity={0.8}
          accessibilityLabel={isFavorited ? 'Remove from saved' : 'Save this listing'}
        >
          <Text style={styles.topButtonText}>{isFavorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Image-bound content (Name & Logo) */}
      <View style={styles.imageBottomContent}>
        <View style={styles.nameRow}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={2}>{name}</Text>
            {area ? (
              <Text style={styles.area} numberOfLines={1}>📍 {area}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Content below the image */}
      <View style={styles.belowImageContent}>
        {/* Badges row */}
        <View style={styles.badgesRow}>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
          {settlrScore != null && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{settlrScore.toFixed(1)}</Text>
              <Text style={styles.scoreLabel}> Settlr</Text>
            </View>
          )}
          <View style={styles.ratingBadge}>
            {reviewCount > 0 ? (
              <RatingStars rating={rating} count={reviewCount} size="md" />
            ) : (
              <Text style={styles.noRatingsText}>No ratings yet</Text>
            )}
          </View>
        </View>

        {/* Updated At */}
        <View style={styles.updatedRow}>
          <Text style={styles.updatedText}>Last updated {new Date(updatedAt).toLocaleDateString()}</Text>
        </View>

        {/* Mocked Social Proof Indicators -> Real Social Proof */}
        {reviewCount === 0 && viewsCount === 0 && savesCount === 0 && contactsCount === 0 ? (
          <View style={styles.socialProofRow}>
            <View style={styles.socialProofItem}>
              <Text style={styles.socialProofIcon}>✨</Text>
              <Text style={styles.socialProofText}>New Listing — Recently added to Settlr</Text>
            </View>
          </View>
        ) : (
          (viewsCount > 0 || savesCount > 0 || contactsCount > 0) && (
            <View style={styles.socialProofRow}>
              {viewsCount > 0 && (
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofIcon}>👀</Text>
                  <Text style={styles.socialProofText}>
                    {viewsCount} Student{viewsCount === 1 ? '' : 's'} Viewed
                  </Text>
                </View>
              )}
              {savesCount > 0 && (
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofIcon}>❤️</Text>
                  <Text style={styles.socialProofText}>
                    {savesCount} Student{savesCount === 1 ? '' : 's'} Saved
                  </Text>
                </View>
              )}
              {contactsCount > 0 && (
                <View style={styles.socialProofItem}>
                  <Text style={styles.socialProofIcon}>📞</Text>
                  <Text style={styles.socialProofText}>
                    {contactsCount} Student{contactsCount === 1 ? '' : 's'} Contacted
                  </Text>
                </View>
              )}
            </View>
          )
        )}

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroActionButton}
            onPress={onFavoritePress}
            activeOpacity={0.8}
            accessibilityLabel="Save this listing"
          >
            <Text style={styles.heroActionEmoji}>{isFavorited ? '❤️' : '🤍'}</Text>
            <Text style={styles.heroActionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export const ListingHero = React.memo(ListingHeroComponent)
ListingHero.displayName = 'ListingHero'

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: SCREEN_WIDTH,
    minHeight: 420,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 420,
  },
  placeholder: {
    backgroundColor: colors.darkCard,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  topActions: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(15,11,24,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonText: {
    fontSize: 22,
  },
  imageBottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  belowImageContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  area: {
    fontSize: fontSize.md,
    color: colors.darkMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    backgroundColor: colors.emerald,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '700',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.violet,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  scoreText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.white,
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noRatingsText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  updatedRow: {
    marginBottom: spacing.md,
  },
  updatedText: {
    fontSize: fontSize.xs,
    color: colors.darkMuted,
    fontWeight: '500',
  },
  socialProofRow: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  socialProofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  socialProofIcon: {
    fontSize: 14,
  },
  socialProofText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  heroActionButton: {
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  heroActionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  heroActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.darkMuted,
  },
})
