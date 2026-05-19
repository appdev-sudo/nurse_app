/**
 * ConsentFormScreen — Client consent acknowledgment with checkbox.
 * (Signature canvas can be added when react-native-signature-canvas is linked.)
 */
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { submitConsent } from '../api';
import { CustomButton } from '../components/CustomButton';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'ConsentForm'>;

const consentItems = [
  'I have been informed about the procedure, its benefits, and potential risks.',
  'I understand that the service is being provided at my requested location.',
  'I consent to the recording of my vitals and health data for treatment purposes.',
  'I have disclosed all relevant medical history and current medications.',
  'I understand I can withdraw consent at any time during the procedure.',
];

export const ConsentFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [checked, setChecked] = useState<boolean[]>(consentItems.map(() => false));
  const [loading, setLoading] = useState(false);

  const toggleItem = (index: number) => {
    setChecked(prev => { const n = [...prev]; n[index] = !n[index]; return n; });
  };

  const allChecked = checked.every(Boolean);

  const handleSubmit = async () => {
    if (!allChecked) { Alert.alert('Error', 'Please acknowledge all consent items.'); return; }
    setLoading(true);
    try {
      if (token) await submitConsent(token, bookingId, 'checkbox_consent');
      Alert.alert('Consent Recorded', 'The consent has been saved successfully.');
      navigation.goBack();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Consent Form</Text>
      <Text style={styles.subtitle}>The client must acknowledge the following before proceeding:</Text>

      {consentItems.map((item, i) => (
        <Pressable key={i} onPress={() => toggleItem(i)} style={styles.checkRow}>
          <MaterialCommunityIcons
            name={checked[i] ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24} color={checked[i] ? colors.accentGreen : colors.textSecondary} />
          <Text style={[styles.checkText, checked[i] && styles.checkTextActive]}>{item}</Text>
        </Pressable>
      ))}

      <CustomButton title="Submit Consent" onPress={handleSubmit} loading={loading}
        disabled={!allChecked} variant={allChecked ? 'success' : 'primary'} style={{ marginTop: spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg, paddingRight: spacing.lg },
  checkText: { flex: 1, fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, lineHeight: 20 },
  checkTextActive: { color: colors.textPrimary },
});
