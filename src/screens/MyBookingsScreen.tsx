/**
 * MyBookingsScreen — Dedicated screen for the "Bookings" bottom tab.
 * Shows only the nurse's OWN bookings with filter tabs: All / Assigned / Active / Completed
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { getNurseBookings, acceptBooking, rejectBooking } from '../api';
import { JobCard } from '../components/JobCard';
import { formatShortDate, formatTime, extractCity } from '../utils/helpers';
import type { Booking, BookingCardData, BookingStatus } from '../types/booking';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>;

type FilterTab = 'all' | 'assigned' | 'active' | 'completed';

const filterTabs: { key: FilterTab; label: string; icon: string; color: string }[] = [
  { key: 'all', label: 'All', icon: 'format-list-bulleted', color: colors.accentTeal },
  { key: 'assigned', label: 'Assigned', icon: 'bell-ring-outline', color: colors.accentCyan },
  { key: 'active', label: 'Active', icon: 'play-circle-outline', color: colors.accentGreen },
  { key: 'completed', label: 'Done', icon: 'check-decagram', color: colors.accentAqua },
];

export const MyBookingsScreen: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation<Nav>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getNurseBookings(token);
      setBookings(data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err.message);
    } finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const toCardData = (b: Booking): BookingCardData => ({
    id: b._id,
    location: typeof b.user === 'object'
      ? extractCity((b.user as any)?.location?.address?.city || b.address?.city || b.address?.formattedAddress || '')
      : extractCity(b.address?.city || b.address?.formattedAddress || ''),
    service: b.serviceTitle,
    time: formatTime(b.preferredTimeSlot),
    date: formatShortDate(b.preferredDate),
    status: b.status,
    isSubSession: b.isSubSession,
    sessionName: b.sessionName,
  });

  const handleAccept = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await acceptBooking(token, id);
      Alert.alert('Accepted!', 'Booking confirmed.');
      fetchBookings();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    Alert.alert('Reject Booking?', 'This will reassign to another nurse.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        if (!token) return;
        setActionLoading(id);
        try { await rejectBooking(token, id); fetchBookings(); }
        catch (err: any) { Alert.alert('Error', err.message); }
        finally { setActionLoading(null); }
      }},
    ]);
  };

  const handlePress = (id: string) => { navigation.navigate('BookingDetail', { bookingId: id }); };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    switch (activeFilter) {
      case 'assigned': return b.status === 'assigned';
      case 'active': return ['accepted', 'in_progress'].includes(b.status);
      case 'completed': return b.status === 'completed';
      default: return true;
    }
  });

  // Counts for each tab
  const counts: Record<FilterTab, number> = {
    all: bookings.length,
    assigned: bookings.filter(b => b.status === 'assigned').length,
    active: bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.accentTeal} /></View>;
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[styles.tab, isActive && { backgroundColor: tab.color + '20', borderColor: tab.color }]}>
              <MaterialCommunityIcons name={tab.icon} size={16} color={isActive ? tab.color : colors.textSecondary} />
              <Text style={[styles.tabLabel, isActive && { color: tab.color }]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, { backgroundColor: isActive ? tab.color : 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.tabBadgeText, isActive && { color: colors.backgroundNavy }]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <JobCard
            booking={toCardData(item)}
            onAccept={handleAccept}
            onReject={handleReject}
            onPress={handlePress}
            loading={actionLoading === item._id}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentTeal} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {activeFilter === 'all' ? 'No bookings yet' : `No ${activeFilter} bookings`}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all' ? 'Claim available jobs from the Dashboard' : 'Try a different filter'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundNavy },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  title: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.xs, marginBottom: spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  tabLabel: { fontFamily: fonts.primary, fontSize: fontSizes.xxs, fontWeight: fontWeights.semibold as any, color: colors.textSecondary },
  tabBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontFamily: fonts.primary, fontSize: 10, fontWeight: fontWeights.bold as any, color: colors.textMuted },
  listContent: { paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.section * 2 },
  emptyText: { fontFamily: fonts.display, fontSize: fontSizes.h3, color: colors.textPrimary, marginTop: spacing.md },
  emptySubtext: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.xs },
});
