/**
 * NurseOnboardingScreen — Multi-step registration: personal details + document upload.
 */
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { registerNurse, uploadDocument } from '../api';
import { generateTempNurseId } from '../utils/helpers';
import { CustomButton } from '../components/CustomButton';
import type { OnboardingData } from '../types/auth';

// Using launchImageLibrary and DocumentPicker conditionally
let launchImageLibrary: any;
let DocumentPicker: any;
try { launchImageLibrary = require('react-native-image-picker').launchImageLibrary; } catch {}
try { DocumentPicker = require('react-native-document-picker').default; } catch {}

export const NurseOnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { token, updateNurse } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nurseId] = useState(generateTempNurseId());
  const [form, setForm] = useState<OnboardingData>({ name: '', age: 0, sex: 'Female', qualifications: [''], specializations: [''] });
  const [docs, setDocs] = useState<{ qualification?: string; aadhaar?: string; profilePic?: string }>({});

  const updateForm = (key: keyof OnboardingData, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePickImage = async (type: 'qualification_certificate' | 'aadhaar' | 'profile_picture') => {
    if (!launchImageLibrary) { Alert.alert('Info', 'Image picker not available'); return; }
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.assets?.[0]) {
        const asset = result.assets[0];
        if (token) {
          const res = await uploadDocument(token, type, asset.uri!, asset.fileName || 'document.jpg', asset.type || 'image/jpeg');
          if (type === 'qualification_certificate') setDocs(p => ({ ...p, qualification: res.url }));
          else if (type === 'aadhaar') setDocs(p => ({ ...p, aadhaar: res.url }));
          else setDocs(p => ({ ...p, profilePic: res.url }));
          Alert.alert('Success', 'Document uploaded');
        }
      }
    } catch (err: any) { Alert.alert('Error', err.message || 'Upload failed'); }
  };

  const handlePickDocument = async () => {
    if (!DocumentPicker) { Alert.alert('Info', 'Document picker not available'); return; }
    try {
      const result = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf, DocumentPicker.types.images] });
      if (result[0] && token) {
        const doc = result[0];
        const res = await uploadDocument(token, 'qualification_certificate', doc.uri, doc.name || 'cert.pdf', doc.type || 'application/pdf');
        setDocs(p => ({ ...p, qualification: res.url }));
        Alert.alert('Success', 'Certificate uploaded');
      }
    } catch (err: any) { if (!DocumentPicker.isCancel(err)) Alert.alert('Error', err.message); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Please enter your name'); return; }
    if (!form.age || form.age < 18) { Alert.alert('Error', 'Please enter a valid age (18+)'); return; }
    setLoading(true);
    try {
      if (token) {
        const res = await registerNurse(token, form);
        updateNurse(res.nurse);
      }
      onComplete();
    } catch (err: any) { Alert.alert('Error', err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
        ))}
      </View>

      {step === 1 && (
        <View>
          <Text style={styles.stepTitle}>Your Nurse ID</Text>
          <View style={styles.idCard}>
            <MaterialCommunityIcons name="identifier" size={24} color={colors.accentTeal} />
            <Text style={styles.idText}>{nurseId}</Text>
          </View>
          <Text style={styles.idHint}>This is your temporary ID. A permanent ID will be assigned after admin approval.</Text>
          <Text style={styles.stepTitle}>Personal Details</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={v => updateForm('name', v)} placeholder="Enter full name" placeholderTextColor={colors.textSecondary} />
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={form.age ? String(form.age) : ''} onChangeText={v => updateForm('age', parseInt(v) || 0)} placeholder="25" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" />
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(['Male', 'Female', 'Other'] as const).map(g => (
              <Pressable key={g} onPress={() => updateForm('sex', g)} style={[styles.genderChip, form.sex === g && styles.genderChipActive]}>
                <Text style={[styles.genderText, form.sex === g && styles.genderTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Qualifications</Text>
          <TextInput style={styles.input} value={form.qualifications[0]} onChangeText={v => updateForm('qualifications', [v])} placeholder="e.g. B.Sc Nursing, GNM" placeholderTextColor={colors.textSecondary} />
          <CustomButton title="Next" onPress={() => setStep(2)} style={{ marginTop: spacing.xl }} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.stepTitle}>Upload Documents</Text>
          <Text style={styles.stepSubtitle}>Please upload the following for verification</Text>
          <Pressable style={styles.uploadCard} onPress={handlePickDocument}>
            <MaterialCommunityIcons name="file-certificate-outline" size={32} color={docs.qualification ? colors.accentGreen : colors.accentTeal} />
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>Qualification Certificate</Text>
              <Text style={styles.uploadStatus}>{docs.qualification ? '✓ Uploaded' : 'Tap to upload PDF or image'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.uploadCard} onPress={() => handlePickImage('aadhaar')}>
            <MaterialCommunityIcons name="card-account-details-outline" size={32} color={docs.aadhaar ? colors.accentGreen : colors.accentTeal} />
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>Aadhaar Card (Photo ID)</Text>
              <Text style={styles.uploadStatus}>{docs.aadhaar ? '✓ Uploaded' : 'Tap to upload image'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.uploadCard} onPress={() => handlePickImage('profile_picture')}>
            <MaterialCommunityIcons name="camera-outline" size={32} color={docs.profilePic ? colors.accentGreen : colors.accentTeal} />
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>Profile Picture</Text>
              <Text style={styles.uploadStatus}>{docs.profilePic ? '✓ Uploaded' : 'Tap to upload photo'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.buttonRow}>
            <CustomButton title="Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
            <CustomButton title="Next" onPress={() => setStep(3)} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.stepTitle}>Review & Submit</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>Name</Text><Text style={styles.reviewValue}>{form.name}</Text>
            <Text style={styles.reviewLabel}>Age</Text><Text style={styles.reviewValue}>{form.age}</Text>
            <Text style={styles.reviewLabel}>Gender</Text><Text style={styles.reviewValue}>{form.sex}</Text>
            <Text style={styles.reviewLabel}>Qualifications</Text><Text style={styles.reviewValue}>{form.qualifications.join(', ')}</Text>
            <Text style={styles.reviewLabel}>Nurse ID</Text><Text style={styles.reviewValue}>{nurseId}</Text>
            <Text style={styles.reviewLabel}>Documents</Text>
            <Text style={styles.reviewValue}>{[docs.qualification && 'Certificate', docs.aadhaar && 'Aadhaar', docs.profilePic && 'Photo'].filter(Boolean).join(', ') || 'None uploaded'}</Text>
          </View>
          <View style={styles.buttonRow}>
            <CustomButton title="Back" onPress={() => setStep(2)} variant="outline" style={{ flex: 1 }} />
            <CustomButton title="Submit" onPress={handleSubmit} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xxl },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressDotActive: { backgroundColor: colors.accentTeal },
  stepTitle: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.lg },
  stepSubtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginBottom: spacing.xl },
  label: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium as any, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderChip: { flex: 1, paddingVertical: spacing.sm, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  genderChipActive: { backgroundColor: 'rgba(45,212,191,0.15)', borderColor: colors.accentTeal },
  genderText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary },
  genderTextActive: { color: colors.accentTeal, fontWeight: fontWeights.semibold as any },
  idCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 12, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' },
  idText: { fontFamily: fonts.primary, fontSize: fontSizes.h3, fontWeight: fontWeights.bold as any, color: colors.accentTeal, letterSpacing: 1 },
  idHint: { fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.xs },
  uploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, borderRadius: 14, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: spacing.md },
  uploadInfo: { flex: 1 },
  uploadTitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.textPrimary },
  uploadStatus: { fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  reviewCard: { backgroundColor: colors.backgroundCard, borderRadius: 14, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  reviewLabel: { fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.sm },
  reviewValue: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: fontWeights.medium as any },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
});
