import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../lib/tokens';

interface SettlrSummaryProps {
  summary: string;
}

const SettlrSummary: React.FC<SettlrSummaryProps> = ({ summary }) => (
  <View style={styles.container}>
    <View style={styles.accent} />
    <Text style={styles.text}>{summary}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.violet,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  text: {
    fontSize: fontSize.md,
    color: 'rgba(243,240,255,0.7)',
    lineHeight: 28,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});

export default React.memo(SettlrSummary);
