/**
 * Onboarding persistence — tracks whether the intro slides have been seen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@vytalyou_nurse_onboarding_completed';

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, completed ? 'true' : 'false');
  } catch (e) {
    // Silently ignore; onboarding will show again if persistence fails
  }
}

export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
}
