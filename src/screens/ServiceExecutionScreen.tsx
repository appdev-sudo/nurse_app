/**
 * ServiceExecutionScreen — Strict checklist flow:
 * Start OTP → Verify Details → Admin Chart → Consent → End OTP → Feedback
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { getBookingById, startService, endService } from '../api';
import { OTPInput } from '../components/OTPInput';
import { CustomButton } from '../components/CustomButton';
import type { Booking, CustomerInfo } from '../types/booking';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceExecution'>;
type Step = 'start_otp' | 'verify_details' | 'admin_chart' | 'consent' | 'end_otp' | 'complete';

const stepLabels: Record<Step, string> = {
  start_otp: 'Start OTP', verify_details: 'Verify Details', admin_chart: 'Admin Chart',
  consent: 'Consent Form', end_otp: 'End OTP', complete: 'Complete',
};
const stepIcons: Record<Step, string> = {
  start_otp: 'lock-open-outline', verify_details: 'account-check-outline', admin_chart: 'clipboard-pulse-outline',
  consent: 'file-sign', end_otp: 'lock-check-outline', complete: 'check-decagram',
};

export const ServiceExecutionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('start_otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [detailsVerified, setDetailsVerified] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!token) return;
    try {
      const b = await getBookingById(token, bookingId);
      setBooking(b);
      // Resume from correct step
      if (b.status === 'in_progress') {
        if (b.consentSigned) setCurrentStep('end_otp');
        else if (b.adminChart) setCurrentStep('consent');
        else setCurrentStep('verify_details');
      } else if (b.status === 'completed') { setCurrentStep('complete'); }
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }, [token, bookingId]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleStartOTP = async (code?: string) => {
    const c = code || otp.join('');
    if (c.length !== 6) { Alert.alert('Error', 'Enter the 6-digit START OTP'); return; }
    setOtpLoading(true);
    try {
      if (token) {
        await startService(token, bookingId, c);
        // Re-fetch with full population to ensure user data is available
        const fresh = await getBookingById(token, bookingId);
        setBooking(fresh);
      }
      setCurrentStep('verify_details');
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) { Alert.alert('Error', err.message); setOtp(['', '', '', '', '', '']); }
    finally { setOtpLoading(false); }
  };

  const handleEndOTP = async (code?: string) => {
    const c = code || otp.join('');
    if (c.length !== 6) { Alert.alert('Error', 'Enter the 6-digit END OTP'); return; }
    setOtpLoading(true);
    try {
      if (token) { const res = await endService(token, bookingId, c); setBooking(res.booking); }
      setCurrentStep('complete');
      setOtp(['', '', '', '', '', '']);
      navigation.navigate('Feedback', { bookingId });
    } catch (err: any) { Alert.alert('Error', err.message); setOtp(['', '', '', '', '', '']); }
    finally { setOtpLoading(false); }
  };

  if (loading || !booking) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.accentTeal} /></View>;
  }

  // Extract customer from the populated user field (Mongoose returns _id, not id)
  const userObj = booking.user && typeof booking.user === 'object' ? (booking.user as any) : null;
  const customer: CustomerInfo | null = userObj
    ? {
        id: userObj._id || userObj.id || '',
        name: userObj.name || '',
        phone: userObj.phone || '',
        age: userObj.age,
        sex: userObj.sex,
        location: userObj.location,
      }
    : null;
  const allSteps: Step[] = ['start_otp', 'verify_details', 'admin_chart', 'consent', 'end_otp', 'complete'];
  const currentIdx = allSteps.indexOf(currentStep);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Progress Steps */}
      <View style={styles.stepsRow}>
        {allSteps.slice(0, -1).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, i < currentIdx && styles.stepDone, i === currentIdx && styles.stepActive]}>
              <MaterialCommunityIcons name={i < currentIdx ? 'check' : stepIcons[s]} size={16}
                color={i <= currentIdx ? colors.backgroundNavy : colors.textSecondary} />
            </View>
            {i < allSteps.length - 2 && <View style={[styles.stepLine, i < currentIdx && styles.stepLineDone]} />}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{stepLabels[currentStep]}</Text>

      {/* Step: Start OTP */}
      {currentStep === 'start_otp' && (
        <View style={styles.stepContent}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.accentCyan} />
            <Text style={styles.infoText}>Ask the client for the START OTP displayed on their app.</Text>
          </View>
          <OTPInput value={otp} onChange={setOtp} onComplete={handleStartOTP} disabled={otpLoading} />
          {otpLoading && <ActivityIndicator color={colors.accentTeal} style={{ marginTop: spacing.lg }} />}
          <CustomButton title="Verify & Start" onPress={() => handleStartOTP()} loading={otpLoading} style={{ marginTop: spacing.xxl }} />
        </View>
      )}

      {/* Step: Verify Details */}
      {currentStep === 'verify_details' && (
        <View style={styles.stepContent}>
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Confirm Client & Service</Text>
            <View style={styles.verifyRow}><Text style={styles.verifyLabel}>Client</Text><Text style={styles.verifyValue}>{customer?.name || customer?.phone || 'Unknown'}</Text></View>
            <View style={styles.verifyRow}><Text style={styles.verifyLabel}>Service</Text><Text style={styles.verifyValue}>{booking.serviceTitle}</Text></View>
            <View style={styles.verifyRow}><Text style={styles.verifyLabel}>Phone</Text><Text style={styles.verifyValue}>{customer?.phone || 'Not available'}</Text></View>
          </View>
          <CustomButton title={detailsVerified ? '✓ Verified — Continue' : 'Confirm Details are Correct'}
            onPress={() => { setDetailsVerified(true); setTimeout(() => setCurrentStep('admin_chart'), 500); }}
            variant={detailsVerified ? 'success' : 'primary'} style={{ marginTop: spacing.xl }} />
        </View>
      )}

      {/* Step: Admin Chart */}
      {currentStep === 'admin_chart' && (
        <View style={styles.stepContent}>
          <Text style={styles.sectionDesc}>Record the patient's vitals and any notes.</Text>
          <CustomButton title="Open Admin Chart Form" onPress={() => navigation.navigate('AdminChartForm', { bookingId })} style={{ marginTop: spacing.lg }} />
          <CustomButton title="Skip → Consent" onPress={() => setCurrentStep('consent')} variant="outline" style={{ marginTop: spacing.md }} />
        </View>
      )}

      {/* Step: Consent */}
      {currentStep === 'consent' && (
        <View style={styles.stepContent}>
          <Text style={styles.sectionDesc}>Get the client's consent signature before proceeding.</Text>
          <CustomButton title="Open Consent Form" onPress={() => navigation.navigate('ConsentForm', { bookingId })} style={{ marginTop: spacing.lg }} />
          <CustomButton title="Skip → End Service" onPress={() => setCurrentStep('end_otp')} variant="outline" style={{ marginTop: spacing.md }} />
        </View>
      )}

      {/* Step: End OTP */}
      {currentStep === 'end_otp' && (
        <View style={styles.stepContent}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.accentCyan} />
            <Text style={styles.infoText}>Ask the client for the END OTP to complete the service.</Text>
          </View>
          <OTPInput value={otp} onChange={setOtp} onComplete={handleEndOTP} disabled={otpLoading} />
          {otpLoading && <ActivityIndicator color={colors.accentTeal} style={{ marginTop: spacing.lg }} />}
          <CustomButton title="Complete Service" onPress={() => handleEndOTP()} loading={otpLoading} variant="success" style={{ marginTop: spacing.xxl }} />
        </View>
      )}

      {/* Step: Complete */}
      {currentStep === 'complete' && (
        <View style={styles.completeContainer}>
          <MaterialCommunityIcons name="check-decagram" size={80} color={colors.accentGreen} />
          <Text style={styles.completeTitle}>Service Completed!</Text>
          <Text style={styles.completeSubtitle}>Great work. The booking has been marked as complete.</Text>
          <CustomButton title="Submit Feedback" onPress={() => navigation.navigate('Feedback', { bookingId })} style={{ marginTop: spacing.xxl }} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 100 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepActive: { backgroundColor: colors.accentTeal, borderColor: colors.accentTeal },
  stepDone: { backgroundColor: colors.accentGreen, borderColor: colors.accentGreen },
  stepLine: { width: 20, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 2 },
  stepLineDone: { backgroundColor: colors.accentGreen },
  stepLabel: { fontFamily: fonts.display, fontSize: fontSizes.h3, fontWeight: fontWeights.bold as any, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xl },
  stepContent: { marginTop: spacing.md },
  infoCard: { flexDirection: 'row', backgroundColor: 'rgba(77,214,255,0.08)', borderRadius: 12, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(77,214,255,0.2)' },
  infoText: { flex: 1, fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.accentCyan, lineHeight: 20 },
  verifyCard: { backgroundColor: colors.backgroundCard, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  verifyTitle: { fontFamily: fonts.display, fontSize: fontSizes.body, fontWeight: fontWeights.bold as any, color: colors.accentTeal, marginBottom: spacing.md },
  verifyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  verifyLabel: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary },
  verifyValue: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium as any, color: colors.textPrimary },
  sectionDesc: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textMuted, lineHeight: 22 },
  completeContainer: { alignItems: 'center', paddingTop: spacing.section },
  completeTitle: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.accentGreen, marginTop: spacing.lg },
  completeSubtitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
