import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../lib/tokens';

interface Place {
  name: string;
  category: string;
  emoji: string;
  distance: string;
}

interface NearbySectionProps {
  places: Place[];
}

const NearbySection = React.memo(function NearbySection({ places }: NearbySectionProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {places.map((place, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.emoji}>{place.emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={styles.category}>{place.category}</Text>
          <Text style={styles.distance}>{place.distance}</Text>
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  card: {
    width: 160,
    backgroundColor: colors.darkCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.darkMuted,
    marginBottom: spacing.xs,
  },
  distance: {
    fontSize: fontSize.xs,
    color: colors.violetLight,
    fontWeight: '600',
  },
});

export default NearbySection;
