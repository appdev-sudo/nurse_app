/**
 * DashboardScreen — Home screen showing:
 * 1. Available (unassigned) customer bookings that nurse can CLAIM
 * 2. Bookings assigned to this nurse (Accept/Reject, active, completed)
 * 3. Clickable filter tabs at the top to filter the view
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { getNurseBookings, getAvailableBookings, claimBooking, acceptBooking, rejectBooking } from '../api';
import { JobCard } from '../components/JobCard';
import { SectionHeader } from '../components/SectionHeader';
import { formatShortDate, formatTime, extractCity } from '../utils/helpers';
import type { Booking, BookingCardData } from '../types/booking';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>;
type DashFilter = 'all' | 'available' | 'active' | 'done';

export const DashboardScreen: React.FC = () => {
  const { token, nurse } = useAuth();
  const navigation = useNavigation<Nav>();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<DashFilter>('all');

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [mine, available] = await Promise.all([
        getNurseBookings(token),
        getAvailableBookings(token),
      ]);
      setMyBookings(mine);
      setAvailableBookings(available);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

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

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleClaim = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await claimBooking(token, id);
      Alert.alert('Claimed!', 'Booking is now assigned to you.');
      fetchAll();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to claim booking');
    } finally { setActionLoading(null); }
  };

  const handleAccept = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await acceptBooking(token, id);
      Alert.alert('Accepted!', 'Booking has been confirmed.');
      fetchAll();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    Alert.alert('Reject Booking?', 'This will reassign the booking to another nurse.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        if (!token) return;
        setActionLoading(id);
        try { await rejectBooking(token, id); fetchAll(); }
        catch (err: any) { Alert.alert('Error', err.message); }
        finally { setActionLoading(null); }
      }},
    ]);
  };

  const handlePress = (id: string) => { navigation.navigate('BookingDetail', { bookingId: id }); };

  // ── Counts ──────────────────────────────────────────────────────────────
  const activeBookings = myBookings.filter(b => ['assigned', 'accepted', 'in_progress'].includes(b.status));
  const completedBookings = myBookings.filter(b => b.status === 'completed').slice(0, 5);

  const counts = {
    available: availableBookings.length,
    active: activeBookings.length,
    done: completedBookings.length,
  };

  // ── Filter logic ────────────────────────────────────────────────────────
  const getFilteredList = (): { data: Booking; source: 'available' | 'mine' }[] => {
    switch (activeFilter) {
      case 'available':
        return availableBookings.map(b => ({ data: b, source: 'available' as const }));
      case 'active':
        return activeBookings.map(b => ({ data: b, source: 'mine' as const }));
      case 'done':
        return completedBookings.map(b => ({ data: b, source: 'mine' as const }));
      default: // 'all'
        return [
          ...availableBookings.map(b => ({ data: b, source: 'available' as const })),
          ...activeBookings.map(b => ({ data: b, source: 'mine' as const })),
          ...completedBookings.map(b => ({ data: b, source: 'mine' as const })),
        ];
    }
  };

  const filteredList = getFilteredList();

  // ── Filter tab config ───────────────────────────────────────────────────
  const tabs: { key: DashFilter; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: counts.available + counts.active + counts.done, color: colors.accentTeal },
    { key: 'available', label: 'Available', count: counts.available, color: colors.accentYellow },
    { key: 'active', label: 'Active', count: counts.active, color: colors.accentGreen },
    { key: 'done', label: 'Done', count: counts.done, color: colors.accentAqua },
  ];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.accentTeal} /></View>;
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {nurse?.name || 'Nurse'} 👋</Text>
          <Text style={styles.subtitle}>{nurse?.nurseId || 'VY-NURSE'}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account-circle" size={40} color={colors.accentTeal} />
        </View>
      </View>

      {/* Clickable Filter Tabs */}
      <View style={styles.tabRow}>
        {tabs.map(tab => {
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[styles.tabCard, isActive && { borderColor: tab.color, backgroundColor: tab.color + '15' }]}>
              <Text style={[styles.tabCount, { color: isActive ? tab.color : colors.textMuted }]}>
                {tab.count}
              </Text>
              <Text style={[styles.tabLabel, isActive && { color: tab.color }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filtered Bookings */}
      <FlatList
        data={filteredList}
        keyExtractor={(item, i) => `${item.data._id}-${i}`}
        renderItem={({ item }) => (
          <JobCard
            booking={toCardData(item.data)}
            onClaim={item.source === 'available' ? handleClaim : undefined}
            onAccept={item.source === 'mine' ? handleAccept : undefined}
            onReject={item.source === 'mine' ? handleReject : undefined}
            onPress={handlePress}
            loading={actionLoading === item.data._id}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentTeal} />}
        ListHeaderComponent={
          <SectionHeader
            title={activeFilter === 'all' ? 'All Bookings' : activeFilter === 'available' ? '🆕 Available Jobs' : activeFilter === 'active' ? '📋 Active Bookings' : '✅ Completed'}
            subtitle="Pull down to refresh"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {activeFilter === 'available' ? 'No available jobs' : activeFilter === 'active' ? 'No active bookings' : activeFilter === 'done' ? 'No completed bookings' : 'No bookings yet'}
            </Text>
            <Text style={styles.emptySubtext}>Customer bookings will appear here</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  greeting: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.accentTeal, marginTop: 2, letterSpacing: 0.5 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(45,212,191,0.12)', alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tabCard: { flex: 1, backgroundColor: colors.backgroundCard, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)' },
  tabCount: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any },
  tabLabel: { fontFamily: fonts.primary, fontSize: fontSizes.xxs, fontWeight: fontWeights.semibold as any, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.section * 2 },
  emptyText: { fontFamily: fonts.display, fontSize: fontSizes.h3, color: colors.textPrimary, marginTop: spacing.md },
  emptySubtext: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.xs },
});
