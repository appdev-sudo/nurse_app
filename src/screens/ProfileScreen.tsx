/**
 * ProfileScreen — Nurse profile display and settings.
 */
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useAuth } from '../utils/authContext';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';

export const ProfileScreen: React.FC = () => {
  const { nurse, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'file-document-outline', label: 'My Documents', onPress: () => {} },
    { icon: 'history', label: 'Booking History', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'shield-lock-outline', label: 'Privacy Policy', onPress: () => {} },
    { icon: 'information-outline', label: 'About VytalYou', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={48} color={colors.accentTeal} />
        </View>
        <Text style={styles.name}>{nurse?.name || 'Nurse'}</Text>
        <Text style={styles.nurseId}>{nurse?.nurseId || 'VY-NURSE-XXXXX'}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge label={nurse?.isApproved ? 'Approved' : 'Pending Approval'}
            color={nurse?.isApproved ? colors.accentGreen : colors.accentYellow} />
          {nurse?.isPhoneVerified && <StatusBadge label="Phone Verified" color={colors.accentTeal} />}
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="phone" size={18} color={colors.accentTeal} />
          <Text style={styles.infoText}>{nurse?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="email-outline" size={18} color={colors.accentTeal} />
          <Text style={styles.infoText}>{nurse?.email || 'N/A'}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <Pressable key={i} onPress={item.onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
            <MaterialCommunityIcons name={item.icon as any} size={22} color={colors.accentTeal} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <CustomButton title="Logout" onPress={handleLogout} variant="danger" style={{ marginTop: spacing.xl }} />
      <Text style={styles.version}>VytalYou Nurse v0.0.1</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNavy },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: 120 },
  profileCard: { alignItems: 'center', backgroundColor: colors.backgroundCard, borderRadius: 20, padding: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: spacing.lg },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 2, borderColor: 'rgba(45,212,191,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  name: { fontFamily: fonts.display, fontSize: fontSizes.h2, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  nurseId: { fontFamily: fonts.primary, fontSize: fontSizes.small, color: colors.accentTeal, letterSpacing: 1, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, borderRadius: 12, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  infoText: { fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted, flexShrink: 1 },
  menuCard: { backgroundColor: colors.backgroundCard, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  menuPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  menuLabel: { flex: 1, fontFamily: fonts.primary, fontSize: fontSizes.body, color: colors.textPrimary },
  version: { fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
});
