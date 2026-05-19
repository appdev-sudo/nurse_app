/**
 * BookingDetailScreen — Full details of an accepted booking.
 * Shows client info, address with Google Maps link, and inventory.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [b, inv] = await Promise.all([
        getBookingById(token, bookingId),
        getBookingInventory(token, bookingId).catch(() => ({ inventory: [] })),
      ]);
      setBooking(b);
      setInventory(inv.inventory || []);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }, [token, bookingId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStartService = () => { navigation.navigate('ServiceExecution', { bookingId }); };

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

      {/* Inventory */}
      {inventory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Required Inventory</Text>
          {inventory.map((item, i) => (
            <View key={i} style={styles.inventoryRow}>
              <MaterialCommunityIcons name={item.isAvailable ? 'check-circle' : 'alert-circle'} size={18} color={item.isAvailable ? colors.accentGreen : colors.accentOrange} />
              <Text style={styles.inventoryName}>{item.name}</Text>
              <Text style={styles.inventoryQty}>{item.quantity} {item.unit}</Text>
            </View>
          ))}
        </View>
      )}

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
  inventoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  inventoryName: { flex: 1, fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textPrimary },
  inventoryQty: { fontFamily: fonts.primary, fontSize: fontSizes.small, fontWeight: fontWeights.semibold as any, color: colors.accentTeal },
  notesText: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textMuted, lineHeight: 20 },
});
