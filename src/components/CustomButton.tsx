/**
 * Reusable primary/secondary button with loading state.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const labelStyles: TextStyle[] = [
    styles.label,
    styles[`label_${size}`],
    styles[`labelColor_${variant}`],
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !isDisabled && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.accentTeal : colors.backgroundNavy}
          size="small"
        />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },

  // ── Sizes ───────────────────────────────────
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },

  // ── Variants ────────────────────────────────
  variant_primary: {
    backgroundColor: colors.accentTeal,
    shadowColor: colors.accentTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  variant_secondary: {
    backgroundColor: colors.accentAqua,
  },
  variant_danger: {
    backgroundColor: colors.accentRed,
  },
  variant_success: {
    backgroundColor: colors.accentGreen,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accentTeal,
  },

  // ── Labels ──────────────────────────────────
  label: {
    fontFamily: fonts.primary,
    fontWeight: fontWeights.semibold as any,
  },
  label_sm: {
    fontSize: fontSizes.small,
  },
  label_md: {
    fontSize: fontSizes.body,
  },
  label_lg: {
    fontSize: fontSizes.h3,
  },
  labelColor_primary: {
    color: colors.backgroundNavy,
  },
  labelColor_secondary: {
    color: colors.backgroundNavy,
  },
  labelColor_danger: {
    color: colors.textPrimary,
  },
  labelColor_success: {
    color: colors.backgroundNavy,
  },
  labelColor_outline: {
    color: colors.accentTeal,
  },
});
