import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../lib/tokens';

interface Fact {
  emoji: string;
  label: string;
  value: string;
}

interface QuickFactsRowProps {
  facts: Fact[];
  tags?: string[];
}

const QuickFactsRow = React.memo(function QuickFactsRow({ facts, tags = [] }: QuickFactsRowProps) {
  if (facts.length === 0 && tags.length === 0) return null;

  return (
    <View style={styles.container}>
      {tags.map((tag, index) => (
        <View key={`tag-${index}`} style={[styles.pill, styles.tagPill]}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
      
      {facts.map((fact, index) => (
        <View key={`fact-${index}`} style={styles.pill}>
          <Text style={styles.emoji}>{fact.emoji}</Text>
          <Text style={styles.value}>{fact.value}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    gap: spacing.xs,
  },
  tagPill: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.violetLight,
  },
  emoji: {
    fontSize: fontSize.md,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '600',
  },
});

export default QuickFactsRow;
