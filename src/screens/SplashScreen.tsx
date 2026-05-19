/**
 * SplashScreen — Animated brand reveal for the Nurse App.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';

interface SplashScreenProps {
  isAppReady: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isAppReady,
  onFinish,
}) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle fade in
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [logoScale, logoOpacity, subtitleOpacity, pulseAnim]);

  useEffect(() => {
    if (isAppReady) {
      const timer = setTimeout(onFinish, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAppReady, onFinish]);

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { scale: pulseAnim }],
          },
        ]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="stethoscope"
            size={56}
            color={colors.accentTeal}
          />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: logoOpacity }}>
        <Text style={styles.brand}>VytalYou</Text>
        <Text style={styles.appName}>NURSE</Text>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Empowering healthcare at home
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(45, 212, 191, 0.05)',
  },
  glowInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  logoContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: fontWeights.bold as any,
    color: colors.accentAqua,
    textAlign: 'center',
    letterSpacing: 2,
  },
  appName: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.medium as any,
    color: colors.accentTeal,
    textAlign: 'center',
    letterSpacing: 8,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular as any,
    color: colors.textMuted,
    marginTop: 20,
    letterSpacing: 1,
  },
});
