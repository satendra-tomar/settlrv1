import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../../lib/tokens';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  size?: 'lg' | 'xl';
}

const SectionTitle: React.FC<SectionTitleProps> = React.memo(
  ({ title, subtitle, light = false, size = 'lg' }) => {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: light ? colors.white : colors.ink },
            size === 'xl' && { fontSize: 24, marginBottom: spacing.sm },
          ]}
        >
          {title}
        </Text>
        {subtitle != null && (
          <Text
            style={[
              styles.subtitle,
              { color: light ? colors.darkMuted : colors.muted },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  },
);

SectionTitle.displayName = 'SectionTitle';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

export default SectionTitle;
