/**
 * AuthStack — Phone auth → OTP verification.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PhoneAuthScreen } from '../screens/PhoneAuthScreen';
import { OTPVerificationScreen } from '../screens/OTPVerificationScreen';
import { colors } from '../theme/colors';
import type { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundNavy },
        headerTintColor: colors.accentTeal,
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
