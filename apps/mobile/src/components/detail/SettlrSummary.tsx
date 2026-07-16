import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../lib/tokens';

interface SettlrSummaryProps {
  summary: string;
}

const CHARACTER_LIMIT = 200;

export default function SettlrSummary({ summary }: SettlrSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!summary) return null;

  const isLong = summary.length > CHARACTER_LIMIT;
  const displayedText = (expanded || !isLong) ? summary : `${summary.slice(0, CHARACTER_LIMIT)}...`;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayedText}</Text>
      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          style={styles.toggleBtn}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Read Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  text: {
    fontSize: fontSize.md,
    color: 'rgba(243,240,255,0.85)',
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  toggleBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.violetLight,
  },
});
