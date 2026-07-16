import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../lib/tokens';
import ExperienceScoreCard from './ExperienceScoreCard';

interface ScoreItem {
  label: string;
  score: number;
  emoji: string;
}

interface ExperienceGridProps {
  scores: ScoreItem[];
}

const ExperienceGrid: React.FC<ExperienceGridProps> = ({ scores }) => {
  return (
    <View style={styles.grid}>
      {scores.map((item) => (
        <View key={item.label} style={styles.cardWrapper}>
          <ExperienceScoreCard
            label={item.label}
            score={item.score}
            emoji={item.emoji}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardWrapper: {
    width: '48.5%',
  },
});

export default React.memo(ExperienceGrid);
