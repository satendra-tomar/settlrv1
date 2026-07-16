import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../lib/tokens';

interface Fact {
  emoji: string;
  label: string;
  value: string;
}

interface QuickFactsRowProps {
  facts: Fact[];
}

const QuickFactsRow = React.memo(function QuickFactsRow({ facts }: QuickFactsRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {facts.map((fact, index) => (
        <View key={index} style={styles.pill}>
          <Text style={styles.emoji}>{fact.emoji}</Text>
          <Text style={styles.label}>{fact.label}</Text>
          <Text style={styles.value}>{fact.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: fontSize.md,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.darkMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: fontSize.xs,
    color: colors.darkText,
    fontWeight: '700',
  },
});

export default QuickFactsRow;
