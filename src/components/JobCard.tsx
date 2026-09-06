/**
 * JobCard — Displays a booking request in the compact
 * "Location | Service | Time" format with Accept/Reject actions.
 */
import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { BookingCardData, BookingStatus } from '../types/booking';

interface JobCardProps {
  booking: BookingCardData;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onClaim?: (id: string) => void;
  onPress?: (id: string) => void;
  loading?: boolean;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: 'Available', color: colors.accentYellow, icon: 'clock-outline' },
  assigned: { label: 'New Request', color: colors.accentCyan, icon: 'bell-ring-outline' },
  accepted: { label: 'Accepted', color: colors.accentGreen, icon: 'check-circle-outline' },
  in_progress: { label: 'In Progress', color: colors.accentTeal, icon: 'play-circle-outline' },
  completed: { label: 'Completed', color: colors.accentAqua, icon: 'check-decagram' },
  cancelled: { label: 'Cancelled', color: colors.textSecondary, icon: 'close-circle-outline' },
  rejected: { label: 'Rejected', color: colors.accentRed, icon: 'close-circle-outline' },
};

export const JobCard: React.FC<JobCardProps> = ({
  booking,
  onAccept,
  onReject,
  onClaim,
  onPress,
  loading = false,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, scaleAnim]);

  const config = statusConfig[booking.status];
  const showActions = booking.status === 'assigned';
  const showClaim = booking.status === 'pending';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: slideAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}>
      <Pressable
        onPress={() => onPress?.(booking.id)}
        style={({ pressed }) => [
          styles.cardInner,
          pressed && styles.cardPressed,
        ]}
        disabled={loading}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={14}
            color={config.color}
          />
          <Text style={[styles.statusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>

        {/* Main Info */}
        <View style={styles.infoContainer}>
          {/* Service Name */}
          <View style={styles.infoLine}>
            <MaterialCommunityIcons name="medical-bag" size={16} color={colors.accentTeal} style={styles.iconMargin} />
            <Text style={styles.primaryText} numberOfLines={2}>
              {booking.isSubSession && booking.sessionName ? booking.sessionName : booking.service}
            </Text>
          </View>
          
          {/* Client Name */}
          <View style={styles.infoLine}>
            <MaterialCommunityIcons name="account-outline" size={16} color={colors.accentTeal} style={styles.iconMargin} />
            <Text style={styles.secondaryText} numberOfLines={1}>
              {booking.clientName || 'Client TBD'}
            </Text>
          </View>

          {/* Location & Time Row */}
          <View style={styles.infoLine}>
            <View style={styles.flexHalf}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.accentTeal} style={styles.iconMargin} />
              <Text style={styles.secondaryText} numberOfLines={1}>
                {!booking.location || booking.location === 'Unknown' ? 'Location TBD' : booking.location}
              </Text>
            </View>
            <View style={styles.flexHalf}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.accentTeal} style={styles.iconMargin} />
              <Text style={styles.secondaryText} numberOfLines={1}>
                {booking.time || 'Time TBD'}
              </Text>
            </View>
          </View>

          {/* Date & Type Row */}
          <View style={styles.infoLine}>
             <View style={styles.flexHalf}>
               <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={colors.accentTeal} style={styles.iconMargin} />
               <Text style={styles.secondaryText} numberOfLines={1}>
                 {booking.date || 'Date TBD'}
               </Text>
             </View>
             <View style={styles.flexHalf}>
               {booking.isSubSession ? (
                 <View style={styles.badgeSub}><Text style={styles.badgeSubText}>SUBSCRIPTION</Text></View>
               ) : (
                 <View style={styles.badgeInd}><Text style={styles.badgeIndText}>INDIVIDUAL</Text></View>
               )}
             </View>
          </View>
        </View>

        {/* Accept / Reject Actions */}
        {showActions && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onReject?.(booking.id)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && styles.actionPressed,
              ]}
              disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={colors.accentRed}
              />
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>

            <Pressable
              onPress={() => onAccept?.(booking.id)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.acceptButton,
                pressed && styles.actionPressed,
              ]}
              disabled={loading}>
              <MaterialCommunityIcons
                name="check"
                size={18}
                color={colors.backgroundNavy}
              />
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </View>
        )}

        {/* Claim Action for available bookings */}
        {showClaim && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onClaim?.(booking.id)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.claimButton,
                pressed && styles.actionPressed,
              ]}
              disabled={loading}>
              <MaterialCommunityIcons
                name="hand-extended-outline"
                size={18}
                color={colors.backgroundNavy}
              />
              <Text style={styles.claimText}>Claim This Booking</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardInner: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.12)',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: colors.backgroundCardHover,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: 4,
  },
  statusText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginBottom: spacing.md,
    gap: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 8,
  },
  primaryText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    flex: 1,
  },
  secondaryText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    flex: 1,
  },
  badgeSub: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeSubText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeInd: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeIndText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    gap: 6,
  },
  actionPressed: {
    opacity: 0.7,
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 94, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 94, 0.3)',
  },
  acceptButton: {
    backgroundColor: colors.accentGreen,
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold as any,
    color: colors.accentRed,
  },
  acceptText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold as any,
    color: colors.backgroundNavy,
  },
  claimButton: {
    backgroundColor: colors.accentTeal,
    shadowColor: colors.accentTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  claimText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold as any,
    color: colors.backgroundNavy,
  },
});
