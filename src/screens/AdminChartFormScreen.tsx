/**
 * AdminChartFormScreen — Record patient vitals and clinical notes.
 */
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { submitAdminChart } from '../api';
import { CustomButton } from '../components/CustomButton';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'AdminChartForm'>;

export const AdminChartFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (token) {
        await submitAdminChart(token, bookingId, {
          bloodPressure: bp || undefined,
          heartRate: hr ? parseInt(hr) : undefined,
          temperature: temp ? parseFloat(temp) : undefined,
          spo2: spo2 ? parseInt(spo2) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          notes,
        });
      }
      Alert.alert('Saved', 'Admin chart recorded successfully.');
      navigation.goBack();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder: string, kbd?: 'numeric' | 'default') => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={colors.textSecondary} keyboardType={kbd || 'default'} />
    </View>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Chart</Text>
      <Text style={styles.subtitle}>Record patient vitals below</Text>
      {renderField('Blood Pressure', bp, setBp, 'e.g. 120/80 mmHg')}
      {renderField('Heart Rate (bpm)', hr, setHr, 'e.g. 72', 'numeric')}
      {renderField('Temperature (°F)', temp, setTemp, 'e.g. 98.6', 'numeric')}
      {renderField('SpO2 (%)', spo2, setSpo2, 'e.g. 98', 'numeric')}
      {renderField('Weight (kg)', weight, setWeight, 'e.g. 65', 'numeric')}
      <View style={styles.field}>
        <Text style={styles.label}>Clinical Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes}
          placeholder="Any observations, symptoms, or notes..." placeholderTextColor={colors.textSecondary}
          multiline numberOfLines={5} textAlignVertical="top" />
      </View>
      <CustomButton title="Save Admin Chart" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium as any, color: colors.textMuted, marginBottom: spacing.xs },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary },
  textArea: { minHeight: 120 },
});
