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
  settlrScore?: number
  quickTags: string[]
  isFavorited: boolean
  onFavoritePress: () => void
  onCallPress?: () => void
  onSharePress?: () => void
}

function ListingHeroComponent({
  images,
  name,
  area,
  rating,
  reviewCount,
  isVerified,
  settlrScore,
  quickTags,
  isFavorited,
  onFavoritePress,
  onCallPress,
  onSharePress,
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
        colors={['transparent', 'rgba(15,11,24,0.6)', colors.dark]}
        locations={[0.4, 0.8, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Top action buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={onSharePress}
          activeOpacity={0.8}
          accessibilityLabel="Share this listing"
        >
          <Text style={styles.topButtonText}>↗</Text>
        </TouchableOpacity>
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
            <RatingStars rating={rating} count={reviewCount} size="md" />
          </View>
        </View>

        {/* Quick tags */}
        {quickTags.length > 0 && (
          <View style={styles.tagsRow}>
            {quickTags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.quickTag}>
                <Text style={styles.quickTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.heroActions}>
          {onCallPress && (
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={onCallPress}
              activeOpacity={0.8}
              accessibilityLabel="Call this listing"
            >
              <Text style={styles.heroActionEmoji}>📞</Text>
              <Text style={styles.heroActionText}>Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.heroActionButton}
            onPress={onFavoritePress}
            activeOpacity={0.8}
            accessibilityLabel="Save this listing"
          >
            <Text style={styles.heroActionEmoji}>{isFavorited ? '❤️' : '🤍'}</Text>
            <Text style={styles.heroActionText}>Save</Text>
          </TouchableOpacity>
          {onSharePress && (
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={onSharePress}
              activeOpacity={0.8}
              accessibilityLabel="Share this listing"
            >
              <Text style={styles.heroActionEmoji}>↗️</Text>
              <Text style={styles.heroActionText}>Share</Text>
            </TouchableOpacity>
          )}
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickTag: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  quickTagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.violetLight,
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
