import React, { useRef, useState } from 'react'
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
} from 'react-native'
import { Image } from 'expo-image'
import { colors, radius, spacing } from '../lib/tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ImageGalleryProps {
  images: { url: string; is_primary: boolean }[]
  height?: number
}

export function ImageGallery({ images, height = 260 }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index)
      }
    },
  ).current

  if (!images || images.length === 0) {
    return <View style={[styles.placeholder, { height }]} />
  }

  // Sort: primary first, then by original order
  const sorted = [...images].sort((a, b) =>
    a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1,
  )

  return (
    <View>
      <FlatList
        data={sorted}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: SCREEN_WIDTH, height }}
            contentFit="cover"
            transition={200}
          />
        )}
      />
      {/* Dot pagination */}
      {sorted.length > 1 && (
        <View style={styles.dotsContainer}>
          {sorted.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.violetBorder,
    width: '100%',
    borderRadius: radius.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  dotActive: {
    backgroundColor: colors.violet,
    width: 16,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
})
