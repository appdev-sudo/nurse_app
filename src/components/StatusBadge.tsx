/**
 * StatusBadge — Small colored chip showing booking/approval status.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface StatusBadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color = colors.accentTeal,
  style,
}) => {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xxs,
    fontWeight: fontWeights.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
