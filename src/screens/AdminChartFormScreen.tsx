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
import { getBookingById, submitAdminChart } from '../api';
import { CustomButton } from '../components/CustomButton';
import type { AdminChart } from '../types/booking';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'AdminChartForm'>;

export const AdminChartFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previousCharts, setPreviousCharts] = useState<AdminChart[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    const fetchBooking = async () => {
      if (!token) return;
      try {
        const b = await getBookingById(token, bookingId);
        if (b.adminCharts) {
          setPreviousCharts(b.adminCharts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchBooking();
  }, [token, bookingId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (token) {
        await submitAdminChart(token, bookingId, {
          bloodPressure: bp.trim(),
          heartRate: parseInt(hr, 10) || undefined,
          spo2: parseInt(spo2, 10) || undefined,
          notes: notes.trim(),
        });
      }
      Alert.alert('Success', 'Admin chart saved successfully');
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
      
      {!fetching && previousCharts.length > 0 && (
        <View style={styles.previousSection}>
          <Pressable style={styles.toggleBtn} onPress={() => setShowPrevious(!showPrevious)}>
            <Text style={styles.toggleBtnText}>{showPrevious ? 'Hide Previous Readings' : `View Previous Readings (${previousCharts.length})`}</Text>
          </Pressable>
          {showPrevious && (
            <View style={styles.previousList}>
              {previousCharts.map((chart, idx) => (
                <View key={idx} style={styles.chartCard}>
                  <Text style={styles.chartTime}>{chart.recordedAt ? new Date(chart.recordedAt).toLocaleTimeString() : 'Unknown Time'}</Text>
                  <Text style={styles.chartData}>BP: {chart.bloodPressure || '--'} | HR: {chart.heartRate || '--'} | SpO2: {chart.spo2 || '--'}%</Text>
                  {chart.notes ? <Text style={styles.chartNotes}>Notes: {chart.notes}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Text style={styles.subtitle}>Record patient vitals below</Text>
      {renderField('Blood Pressure', bp, setBp, 'e.g. 120/80 mmHg')}
      {renderField('Heart Rate (bpm)', hr, setHr, 'e.g. 72', 'numeric')}
      {renderField('SpO2 (%)', spo2, setSpo2, 'e.g. 98', 'numeric')}
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
  previousSection: { marginBottom: spacing.lg, marginTop: spacing.md },
  toggleBtn: { backgroundColor: 'rgba(45,212,191,0.1)', padding: spacing.md, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' },
  toggleBtnText: { fontFamily: fonts.primary, color: colors.accentTeal, fontWeight: fontWeights.bold as any },
  previousList: { marginTop: spacing.sm, gap: spacing.sm },
  chartCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md, borderRadius: 8 },
  chartTime: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, marginBottom: 4 },
  chartData: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: fontWeights.medium as any },
  chartNotes: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 4 },
});
