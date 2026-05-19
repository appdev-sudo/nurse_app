/**
 * SectionHeader — Consistent section heading across screens.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular as any,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
