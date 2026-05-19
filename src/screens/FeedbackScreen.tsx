/**
 * FeedbackScreen — Post-service feedback after End OTP verification.
 */
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { submitFeedback } from '../api';
import { CustomButton } from '../components/CustomButton';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'Feedback'>;

export const FeedbackScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please provide a rating.'); return; }
    setLoading(true);
    try {
      if (token) await submitFeedback(token, bookingId, { rating, comments });
      setSubmitted(true);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <MaterialCommunityIcons name="check-circle" size={80} color={colors.accentGreen} />
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successSubtitle}>Your feedback has been submitted.</Text>
        <CustomButton title="Back to Dashboard" onPress={() => navigation.popToTop()} variant="outline" style={{ marginTop: spacing.xxl }} />
      </View>
    );
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.subtitle}>How was your experience with this client/service?</Text>

      {/* Star Rating */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={44} color={star <= rating ? colors.accentYellow : colors.textSecondary} />
          </Pressable>
        ))}
      </View>
      {rating > 0 && <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>}

      {/* Comments */}
      <Text style={styles.label}>Comments (optional)</Text>
      <TextInput style={styles.textArea} value={comments} onChangeText={setComments}
        placeholder="Share any additional feedback..." placeholderTextColor={colors.textSecondary}
        multiline numberOfLines={4} textAlignVertical="top" />

      <CustomButton title="Submit Feedback" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 100 },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xxl },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  starButton: { padding: spacing.xs },
  ratingLabel: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.semibold as any, color: colors.accentYellow, textAlign: 'center', marginBottom: spacing.xxl },
  label: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium as any, color: colors.textMuted, marginBottom: spacing.xs },
  textArea: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary, minHeight: 100 },
  successContainer: { flex: 1, backgroundColor: colors.backgroundNavy, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  successTitle: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.accentGreen, marginTop: spacing.lg },
  successSubtitle: { fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textMuted, marginTop: spacing.sm },
});
