/**
 * AppTabs — Bottom tab navigator for the main app.
 */
import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeStack } from './HomeStack';
import { BookingsStack } from './BookingsStack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { fonts, fontWeights } from '../theme/typography';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ name, color, focused, size }: { name: string; color: string; focused: boolean; size: number }) => {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 6, tension: 50 }).start();
  }, [focused, scale]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[styles.activeBackground, {
        transform: [{ scale }],
        opacity: scale.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
      }]} />
      <Animated.View style={{ transform: [{ translateY: scale.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }}>
        <MaterialCommunityIcons name={name} color={color} size={focused ? size + 4 : size} style={styles.icon} />
      </Animated.View>
    </View>
  );
};

export const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: colors.accentTeal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen name="Home" component={HomeStack}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color, focused, size }) => <TabIcon name="view-dashboard-outline" color={color} focused={focused} size={size} /> }} />
      <Tab.Screen name="MyBookings" component={BookingsStack}
        options={{ tabBarLabel: 'Bookings', tabBarIcon: ({ color, focused, size }) => <TabIcon name="calendar-check-outline" color={color} focused={focused} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, focused, size }) => <TabIcon name="account-circle-outline" color={color} focused={focused} size={size} /> }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', bottom: 0, left: 4, right: 4, backgroundColor: '#0a1726', borderRadius: 24, height: 72, elevation: 20, shadowColor: colors.accentTeal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18, borderTopWidth: 0, paddingBottom: Platform.OS === 'ios' ? 12 : 0 },
  tabBarItem: { height: 72, justifyContent: 'center', alignItems: 'center', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 8 : 0 },
  tabBarLabel: { fontFamily: fonts.primary, fontSize: 10, fontWeight: fontWeights.semibold as any, marginTop: 4, marginBottom: Platform.OS === 'ios' ? -10 : 8 },
  iconContainer: { justifyContent: 'center', alignItems: 'center', height: 40, width: 40 },
  activeBackground: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentTeal, shadowColor: colors.accentTeal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  icon: { zIndex: 1 },
});
