/**
 * HomeStack — Dashboard → BookingDetail → ServiceExecution → sub-screens.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { ServiceExecutionScreen } from '../screens/ServiceExecutionScreen';
import { AdminChartFormScreen } from '../screens/AdminChartFormScreen';
import { ConsentFormScreen } from '../screens/ConsentFormScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { colors } from '../theme/colors';
import { fonts, fontWeights } from '../theme/typography';
import type { HomeStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundNavy },
        headerTintColor: colors.accentTeal,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.primary, fontWeight: fontWeights.semibold as any },
      }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="ServiceExecution" component={ServiceExecutionScreen} options={{ title: 'Service Checklist' }} />
      <Stack.Screen name="AdminChartForm" component={AdminChartFormScreen} options={{ title: 'Admin Chart' }} />
      <Stack.Screen name="ConsentForm" component={ConsentFormScreen} options={{ title: 'Consent' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
    </Stack.Navigator>
  );
};
