/**
 * RootNavigator — Top-level navigation controller.
 * Handles: Splash → Onboarding → Auth → NurseOnboarding → MainTabs
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { NurseOnboardingScreen } from '../screens/NurseOnboardingScreen';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { AuthProvider, useAuth } from '../utils/authContext';
import { getOnboardingCompleted } from '../utils/onboardingStorage';

const Stack = createNativeStackNavigator();

const RootNavigatorContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const { loading: authLoading, isAuthenticated, nurse } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [nurseOnboardingDone, setNurseOnboardingDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      const completed = await getOnboardingCompleted();
      setOnboardingDone(completed);
      setLoading(false);
    };
    init();
  }, []);

  const appReady = !loading && !authLoading;

  // 1) Splash
  if (!splashDone) {
    return <SplashScreen isAppReady={appReady} onFinish={() => setSplashDone(true)} />;
  }

  // 2) App intro onboarding (first launch)
  if (!onboardingDone) {
    return <OnboardingScreen onFinished={() => setOnboardingDone(true)} />;
  }

  // 3) Not authenticated → Auth flow
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // 4) Authenticated but not onboarded as nurse
  if (nurse && !nurse.isOnboarded && !nurseOnboardingDone) {
    return <NurseOnboardingScreen onComplete={() => setNurseOnboardingDone(true)} />;
  }

  // 5) Fully authenticated → Main app
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <RootNavigatorContent />
    </AuthProvider>
  );
};
