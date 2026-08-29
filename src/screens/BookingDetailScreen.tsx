/**
 * BookingDetailScreen — Full details of an accepted booking.
 * Shows client info, address with Google Maps link, and inventory.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { getBookingById, getBookingInventory } from '../api';
import { CustomButton } from '../components/CustomButton';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatTime } from '../utils/helpers';
import type { Booking, InventoryItem, CustomerInfo } from '../types/booking';
import type { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingDetail'>;

export const BookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Master lists
  const CONSUMABLES = [
    'VEINFLOW', 'SCALP', 'TEGADERM', 'ALCOHOL SWAB', 'IV SET',
    'SYRINGE 10 ML', 'SYRINGE 5 ML', 'NS 500 ML', 'NS 250 ML',
    'NS 100 ML', 'IV PLASTER', 'COCKTAIL KIT', 'GLOVES PAIR'
  ];
  const INJECTABLES = [
    'NAD 500 MG', 'INJ GLUTATHION', 'INJ VITAMIN C', 'INJ NAC',
    'INJ ZINC', 'INJ MAGNESIUM', 'INJ B COMPLEX', 'INJ TRACE ELEMENTS',
    'INJ MVI', 'INJ COLLAGEN', 'INJ L-CARNITINE', 'INJ L-GLUTAMINE 50 ML',
    'INJ ENCICARB 1K', 'INJ ONDEM'
  ];
  const EQUIPMENT = ['IV stand', 'bp monitor', 'pulse oxymeter'];

  // UI State
  const [quantities, setQuantities] = useState<Record<string, number>>(
    CONSUMABLES.reduce((acc, item) => ({ ...acc, [item]: 1 }), {})
  );
  const [doses, setDoses] = useState<Record<string, string>>({});
  const [equipment, setEquipment] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const b = await getBookingById(token, bookingId);
      setBooking(b);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }, [token, bookingId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStartService = () => { 
    // Pass checklist state forward so it can be saved or used during execution
    navigation.navigate('ServiceExecution', { 
      bookingId,
      checklist: { quantities, doses, equipment }
    } as any); 
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

  // Build Google Maps URL using user's stored location coordinates
  const openMaps = () => {
    const lat = customer?.location?.latitude;
    const lng = customer?.location?.longitude;
    const addr = booking.address?.formattedAddress || `${booking.address?.street || ''}, ${booking.address?.city || ''}`;
    const url = lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Status */}
      <StatusBadge label={booking.status.replace('_', ' ').toUpperCase()} color={
        booking.status === 'accepted' ? colors.accentGreen :
        booking.status === 'in_progress' ? colors.accentTeal :
        booking.status === 'completed' ? colors.accentAqua : colors.accentYellow
      } />

      {/* Service Info */}
      <View style={styles.section}>
        <Text style={styles.serviceTitle}>{booking.serviceTitle}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDate(booking.preferredDate)}</Text>
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} style={{ marginLeft: spacing.md }} />
          <Text style={styles.metaText}>{formatTime(booking.preferredTimeSlot)}</Text>
        </View>
      </View>

      {/* Client Details */}
      {customer && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Name</Text><Text style={styles.detailValue}>{customer.name}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{customer.phone}</Text></View>
          {customer.age && <View style={styles.detailRow}><Text style={styles.detailLabel}>Age</Text><Text style={styles.detailValue}>{customer.age}</Text></View>}
          {customer.sex && <View style={styles.detailRow}><Text style={styles.detailLabel}>Gender</Text><Text style={styles.detailValue}>{customer.sex}</Text></View>}
        </View>
      )}

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        <Text style={styles.addressText}>{booking.address?.formattedAddress || `${booking.address?.street}, ${booking.address?.city}`}</Text>
        <Pressable onPress={openMaps} style={styles.mapsButton}>
          <MaterialCommunityIcons name="google-maps" size={20} color={colors.backgroundNavy} />
          <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
        </Pressable>
      </View>

      {/* Consumables Inventory */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Required Consumables</Text>
        {CONSUMABLES.map((item) => (
          <View key={item} style={styles.inventoryRow}>
            <Text style={styles.inventoryName}>{item}</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.qtyButton} 
                onPress={() => setQuantities(prev => ({ ...prev, [item]: Math.max(0, prev[item] - 1) }))}
              >
                <MaterialCommunityIcons name="minus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantities[item]}</Text>
              <TouchableOpacity 
                style={styles.qtyButton} 
                onPress={() => setQuantities(prev => ({ ...prev, [item]: prev[item] + 1 }))}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Injectables & Doses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Injectables & Doses</Text>
        {INJECTABLES.map((item) => (
          <View key={item} style={styles.inventoryRow}>
            <Text style={styles.inventoryName}>{item}</Text>
            <TextInput
              style={styles.doseInput}
              placeholder="Enter dose..."
              placeholderTextColor={colors.textMuted}
              value={doses[item] || ''}
              onChangeText={(text) => setDoses(prev => ({ ...prev, [item]: text }))}
            />
          </View>
        ))}
      </View>

      {/* Equipment Checkboxes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Equipment Checklist</Text>
        {EQUIPMENT.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={styles.checkboxRow}
            onPress={() => setEquipment(prev => ({ ...prev, [item]: !prev[item] }))}
          >
            <MaterialCommunityIcons 
              name={equipment[item] ? 'checkbox-marked' : 'checkbox-blank-outline'} 
              size={24} 
              color={equipment[item] ? colors.accentTeal : colors.textMuted} 
            />
            <Text style={styles.checkboxText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      {booking.notes && (
        <View style={styles.card}><Text style={styles.cardTitle}>Notes</Text><Text style={styles.notesText}>{booking.notes}</Text></View>
      )}

      {/* Action */}
      {(booking.status === 'accepted' || booking.status === 'in_progress') && (
        <CustomButton title={booking.status === 'accepted' ? 'Start Service' : 'Continue Service'} onPress={handleStartService} size="lg" style={{ marginTop: spacing.lg }} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingBottom: 120 },
  section: { marginTop: spacing.lg, marginBottom: spacing.lg },
  serviceTitle: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 4 },
  metaText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary },
  card: { backgroundColor: colors.backgroundCard, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { fontFamily: fonts.display, fontSize: fontSizes.body, fontWeight: fontWeights.bold as any, color: colors.accentTeal, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailLabel: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary },
  detailValue: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium as any, color: colors.textPrimary },
  addressText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  mapsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentGreen, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'flex-start', gap: 6 },
  mapsButtonText: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.semibold as any, color: colors.backgroundNavy },
  inventoryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  inventoryName: { flex: 1, fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textPrimary },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 },
  qtyButton: { padding: 4 },
  qtyText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textPrimary, width: 24, textAlign: 'center', fontWeight: 'bold' as any },
  doseInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: colors.textPrimary, fontFamily: fonts.primary, fontSize: fontSizes.small },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  checkboxText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textPrimary, textTransform: 'capitalize' },
  notesText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, lineHeight: 20 },
});
