/**
 * PhoneAuthScreen — Phone number entry for nurse login.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { sendOTP } from '../api/authApi';
import type { AuthStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) { Alert.alert('Error', 'Please enter your phone number'); return; }
    let formattedPhone = cleanPhone;
    if (!formattedPhone.startsWith('+')) formattedPhone = '+91' + formattedPhone;
    if (formattedPhone.length < 12) { Alert.alert('Error', 'Please enter a valid phone number'); return; }

    setLoading(true);
    try {
      await sendOTP(formattedPhone);
      navigation.navigate('OTPVerification', { phoneNumber: formattedPhone });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="stethoscope" size={40} color={colors.accentTeal} />
        </View>
        <Text style={styles.title}>VytalYou Nurse</Text>
        <Text style={styles.subtitle}>Sign in with your registered phone number</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCode}><Text style={styles.countryCodeText}>+91</Text></View>
          <TextInput style={styles.phoneInput} placeholder="9876543210" placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} maxLength={10} editable={!loading} />
        </View>
        <Text style={styles.hint}>We'll send you a verification code via SMS</Text>
      </View>
      <Pressable onPress={handleSendOTP} style={[styles.button, loading && styles.buttonDisabled]} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.backgroundNavy} /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </Pressable>
      <View style={styles.footer}><Text style={styles.footerText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingTop: spacing.xxl * 2 },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  iconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h1, fontWeight: fontWeights.bold as any, color: colors.accentAqua, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.regular as any, color: colors.textPrimary, opacity: 0.8, textAlign: 'center' },
  form: { marginBottom: spacing.xxl },
  label: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium as any, color: colors.textPrimary, marginBottom: spacing.sm },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', overflow: 'hidden' },
  countryCode: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: 'rgba(45,212,191,0.1)', borderRightWidth: 1, borderRightColor: 'rgba(45,212,191,0.3)' },
  countryCodeText: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.accentTeal },
  phoneInput: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium as any, color: colors.textPrimary },
  hint: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.regular as any, color: colors.textSecondary, marginTop: spacing.sm },
  button: { backgroundColor: colors.accentTeal, borderRadius: 14, paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.xl, shadowColor: colors.accentTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.backgroundNavy },
  footer: { alignItems: 'center' },
  footerText: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.regular as any, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
