/**
 * Navigation param lists for the Nurse App.
 * Typed navigation with React Navigation v7.
 */

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  NurseOnboarding: undefined;
  MainTabs: undefined;
};

export type AuthStackParamList = {
  PhoneAuth: undefined;
  OTPVerification: { phoneNumber: string };
};

export type OnboardingStackParamList = {
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  DocumentUpload: undefined;
  OnboardingComplete: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  BookingDetail: { bookingId: string };
  ServiceExecution: { bookingId: string };
  AdminChartForm: { bookingId: string };
  ConsentForm: { bookingId: string };
  Feedback: { bookingId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};
