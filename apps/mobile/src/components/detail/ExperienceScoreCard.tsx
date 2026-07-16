import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../lib/tokens';

interface ExperienceScoreCardProps {
  label: string;
  score: number;
  emoji: string;
}

const ExperienceScoreCard: React.FC<ExperienceScoreCardProps> = ({ label, score, emoji }) => {
  const fillPercent = Math.min(Math.max(score, 0), 10) / 10;

  return (
    <View style={styles.container} accessibilityLabel={`${label}: ${score} out of 10`}>
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.score}>{score}</Text>
      <View style={styles.trackBar}>
        <View style={[styles.fillBar, { width: `${fillPercent * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.darkMuted,
    fontWeight: '600',
  },
  score: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: spacing.xs,
  },
  trackBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.darkBorder,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fillBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.violet,
  },
});

export default React.memo(ExperienceScoreCard);
