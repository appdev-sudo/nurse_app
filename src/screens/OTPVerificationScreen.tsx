/**
 * OTPVerificationScreen — Verify 6-digit OTP for nurse login.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { verifyOTP, resendOTP } from '../api/authApi';
import { useAuth } from '../utils/authContext';
import { OTPInput } from '../components/OTPInput';
import type { AuthStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { setCanResend(true); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) { Alert.alert('Error', 'Please enter the complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const response = await verifyOTP(phoneNumber, code);
      // The backend returns user; we map it to nurse profile structure
      await login(response.token, response.nurse || (response as any).user);
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setResendLoading(true);
    try {
      await resendOTP(phoneNumber);
      Alert.alert('Success', 'OTP sent successfully');
      setCountdown(60); setCanResend(false); setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally { setResendLoading(false); }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Phone Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </Text>
      </View>
      <OTPInput value={otp} onChange={setOtp} onComplete={handleVerifyOTP} disabled={loading} />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accentTeal} />
          <Text style={styles.loadingText}>Verifying...</Text>
        </View>
      )}
      <View style={styles.resendContainer}>
        {canResend ? (
          <Pressable onPress={handleResendOTP} disabled={resendLoading}>
            <Text style={styles.resendText}>{resendLoading ? 'Sending...' : 'Resend OTP'}</Text>
          </Pressable>
        ) : (
          <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
        )}
      </View>
      <Pressable onPress={() => handleVerifyOTP()} style={[styles.button, loading && styles.buttonDisabled]} disabled={loading}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Change Phone Number</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingTop: spacing.xxl * 2 },
  header: { marginBottom: spacing.xxl },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h1, fontWeight: fontWeights.bold as any, color: colors.accentAqua, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.regular as any, color: colors.textPrimary, opacity: 0.8, lineHeight: 24 },
  phoneNumber: { fontWeight: fontWeights.semibold as any, color: colors.accentTeal },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  loadingText: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.accentTeal, marginLeft: spacing.sm },
  resendContainer: { alignItems: 'center', marginVertical: spacing.xl },
  resendText: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.accentTeal },
  countdownText: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textSecondary },
  button: { backgroundColor: colors.accentTeal, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.backgroundNavy },
  backButton: { alignItems: 'center', paddingVertical: spacing.sm },
  backButtonText: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium as any, color: colors.textSecondary },
});
