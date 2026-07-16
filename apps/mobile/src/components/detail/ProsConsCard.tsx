import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../lib/tokens';

interface ProsConsCardProps {
  pros: { text: string }[];
  cons: { text: string }[];
}

const ProsConsCard: React.FC<ProsConsCardProps> = ({ pros, cons }) => {
  return (
    <View style={styles.container}>
      {pros.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.prosTitle}>💚 Students Love</Text>
          {pros.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.prosBullet}>✓</Text>
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}

      {cons.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.consTitle}>💡 Things To Know</Text>
          {cons.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.consBullet}>•</Text>
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  prosTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.emerald,
    marginBottom: spacing.md,
  },
  consTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.amber,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  prosBullet: {
    color: colors.emerald,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  consBullet: {
    color: colors.amber,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  itemText: {
    fontSize: fontSize.sm,
    color: colors.darkMuted,
    lineHeight: 20,
    flex: 1,
  },
});

export default React.memo(ProsConsCard);
