import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../utils/authContext';
import { getBookingById, updateExpenses, uploadExpenseReceipt } from '../api';
import type { Expense } from '../types/booking';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'ExpensesForm'>;

const PRESET_EXPENSES = [
  'IV drips costs',
  'Medical consumables',
  'Food',
  'Refreshments',
  'Travel allowance'
];

export const ExpensesFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Current expense being added
  const [type, setType] = useState<'Therapeutic' | 'Non-Therapeutic'>('Therapeutic');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) return;
      try {
        const b = await getBookingById(token, bookingId);
        if (b.expenses) setExpenses(b.expenses);
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token, bookingId]);

  const handleAddExpense = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an expense name');
      return;
    }
    const p = parseFloat(price);
    if (isNaN(p) || p < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (!token) return;

    let receiptUrl = undefined;
    if (imageUri) {
      setUploadingImage(true);
      try {
        const res = await uploadExpenseReceipt(token, bookingId, imageUri, 'receipt.jpg', 'image/jpeg');
        receiptUrl = res.url;
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    setExpenses([...expenses, { type, name: name.trim(), price: p, receiptUrl }]);
    setName('');
    setPrice('');
    setImageUri(null);
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await updateExpenses(token, bookingId, expenses);
      Alert.alert('Success', 'Expenses saved successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accentTeal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Manage Expenses</Text>
      <Text style={styles.headerSubtitle}>
        Add any therapeutic or non-therapeutic expenses incurred during this service.
      </Text>

      {/* Added Expenses List */}
      {expenses.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Previously Added Expenses</Text>
          {expenses.map((exp, index) => (
            <View key={index} style={styles.expenseCard}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{exp.name}</Text>
                <Text style={styles.expenseType}>{exp.type}</Text>
                {exp.receiptUrl && <Text style={styles.expenseType}>🖼️ Receipt attached</Text>}
              </View>
              <Text style={styles.expensePrice}>Rs. {exp.price.toFixed(2)}</Text>
              <Pressable onPress={() => handleRemoveExpense(index)} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="delete-outline" size={20} color={colors.accentOrange} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add New Expense Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Add New Expense</Text>

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeBtn, type === 'Therapeutic' && styles.typeBtnActive]}
            onPress={() => setType('Therapeutic')}
          >
            <Text style={[styles.typeBtnText, type === 'Therapeutic' && styles.typeBtnTextActive]}>
              Therapeutic
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, type === 'Non-Therapeutic' && styles.typeBtnActive]}
            onPress={() => setType('Non-Therapeutic')}
          >
            <Text style={[styles.typeBtnText, type === 'Non-Therapeutic' && styles.typeBtnTextActive]}>
              Non-Therapeutic
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Expense Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. IV drips costs"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        
        {/* Preset Chips */}
        <View style={styles.chipsContainer}>
          {PRESET_EXPENSES.map((preset) => (
            <Pressable key={preset} style={styles.chip} onPress={() => setName(preset)}>
              <Text style={styles.chipText}>{preset}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Receipt/Invoice Image (Optional)</Text>
        <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
          <MaterialCommunityIcons name="camera-plus-outline" size={24} color={colors.accentTeal} />
          <Text style={styles.imagePickerText}>{imageUri ? 'Change Image' : 'Upload Screenshot/Invoice'}</Text>
        </Pressable>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

        <CustomButton
          title="+ Add to List"
          onPress={handleAddExpense}
          variant="outline"
          loading={uploadingImage}
          style={{ marginTop: spacing.md }}
        />
      </View>

      <CustomButton
        title="Save Expenses"
        onPress={handleSubmit}
        loading={submitting}
        size="lg"
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 100 },
  headerTitle: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary, marginBottom: spacing.xs },
  headerSubtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSizes.body, fontWeight: fontWeights.bold as any, color: colors.accentTeal, marginBottom: spacing.md },
  listContainer: { marginBottom: spacing.xl },
  expenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  expenseInfo: { flex: 1 },
  expenseName: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium as any, color: colors.textPrimary },
  expenseType: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, marginTop: 2 },
  expensePrice: { fontFamily: fonts.primary, fontSize: fontSizes.body, fontWeight: fontWeights.bold as any, color: colors.accentGreen, marginRight: spacing.md },
  deleteBtn: { padding: 4 },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.02)', padding: spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.backgroundCard, color: colors.textPrimary, fontFamily: fonts.primary, fontSize: fontSizes.body, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: colors.backgroundCard },
  typeBtnActive: { backgroundColor: colors.accentTeal, borderColor: colors.accentTeal },
  typeBtnText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, fontWeight: fontWeights.medium as any },
  typeBtnTextActive: { color: colors.backgroundNavy, fontWeight: fontWeights.bold as any },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary },
  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingVertical: spacing.md, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', borderStyle: 'dashed', marginTop: spacing.xs, gap: spacing.sm },
  imagePickerText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.accentTeal },
  previewImage: { width: '100%', height: 150, borderRadius: 12, marginTop: spacing.md, resizeMode: 'cover' },
});
