import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../lib/tokens';

interface PricingSectionProps {
  type: 'coaching' | 'hostel';
  feePerMonth?: number | null;
  rentMin?: number | null;
  rentMax?: number | null;
}

const formatPrice = (value?: number | null): string =>
  value != null ? value.toLocaleString('en-IN') : '—';

const PricingSection: React.FC<PricingSectionProps> = ({
  type,
  feePerMonth,
  rentMin,
  rentMax,
}) => {
  const isCoaching = type === 'coaching';
  const title = isCoaching ? '🔥 Course Fees' : '🏠 Monthly Rent';

  if (isCoaching) {
    if (feePerMonth == null) {
      return (
        <View style={styles.container} accessibilityLabel={title}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.priceRow}>
            <Text style={styles.priceAvailable}>Contact Institute for Latest Fees</Text>
          </Text>
          <Text style={styles.note}>
            Contact the institute for the latest fee structure.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.container} accessibilityLabel={title}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.priceRow}>
          <Text style={styles.price}>₹{feePerMonth.toLocaleString('en-IN')}</Text>
          <Text style={styles.suffix}>/month</Text>
        </Text>
        <Text style={styles.note}>Prices may vary. Contact for latest fees.</Text>
      </View>
    );
  }

  if (rentMin == null || rentMax == null) {
    return (
      <View style={styles.container} accessibilityLabel={title}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.priceRow}>
          <Text style={styles.priceAvailable}>Contact Hostel for Latest Pricing</Text>
        </Text>
        <Text style={styles.note}>
          Contact the hostel for updated pricing.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={title}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.priceRow}>
        <Text style={styles.price}>
          ₹{rentMin.toLocaleString('en-IN')} – ₹{rentMax.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.suffix}>/month</Text>
      </Text>
      <Text style={styles.note}>Prices may vary. Contact for latest fees.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.darkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
  },
  priceAvailable: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.white,
  },
  suffix: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.darkMuted,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.darkMuted,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});

export default React.memo(PricingSection);
