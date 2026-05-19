/**
 * TypeScript types for Nurse authentication, profile, and onboarding.
 * Maps to the MongoDB Nurse schema on the backend.
 */

// ── OTP / Auth Responses ────────────────────────────────────────────────────
export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  nurse: NurseProfile;
}

// ── Nurse Profile ───────────────────────────────────────────────────────────
export interface NurseProfile {
  id: string;
  nurseId: string;           // Unique VY-NURSE-XXXXX ID
  phone: string;
  name: string;
  email?: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  profilePicture?: string;   // URL
  qualifications: string[];
  specializations: string[];
  isPhoneVerified: boolean;
  isOnboarded: boolean;
  isApproved: boolean;       // Admin approval status
  documents: NurseDocument[];
  location?: NurseLocation;
  createdAt?: string;
  updatedAt?: string;
}

export interface NurseDocument {
  type: 'qualification_certificate' | 'photo_id' | 'aadhaar' | 'profile_picture';
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface NurseLocation {
  latitude: number;
  longitude: number;
  address: Address;
}

// ── Shared Address (matches Customer App schema) ────────────────────────────
export interface Address {
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  formattedAddress: string;
}

// ── Onboarding ──────────────────────────────────────────────────────────────
export interface OnboardingData {
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  email?: string;
  qualifications: string[];
  specializations: string[];
}

export interface ProfileResponse {
  success: boolean;
  nurse: NurseProfile;
  message?: string;
}
