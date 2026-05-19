/**
 * Nurse Profile API — registration, onboarding, document upload.
 */
import { API_ENDPOINTS } from '../config/api';
import { fetchApi, uploadFile } from './client';
import type { NurseProfile, OnboardingData, ProfileResponse } from '../types/auth';

/** Register a new nurse after OTP verification. */
export const registerNurse = async (
  token: string,
  data: OnboardingData,
): Promise<ProfileResponse> => {
  return fetchApi<ProfileResponse>(API_ENDPOINTS.nurseRegister, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
};

/** Fetch the authenticated nurse's profile. */
export const getNurseProfile = async (
  token: string,
): Promise<ProfileResponse> => {
  return fetchApi<ProfileResponse>(API_ENDPOINTS.nurseProfile, { token });
};

/** Update the authenticated nurse's profile. */
export const updateNurseProfile = async (
  token: string,
  data: Partial<NurseProfile>,
): Promise<ProfileResponse> => {
  return fetchApi<ProfileResponse>(API_ENDPOINTS.nurseProfile, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
};

/**
 * Upload a document (qualification cert, photo ID, profile picture).
 * Uses multipart/form-data for Express multer handling.
 */
export const uploadDocument = async (
  token: string,
  documentType: 'qualification_certificate' | 'photo_id' | 'aadhaar' | 'profile_picture',
  fileUri: string,
  fileName: string,
  fileMimeType: string,
): Promise<{ success: boolean; url: string }> => {
  const formData = new FormData();
  formData.append('document', {
    uri: fileUri,
    name: fileName,
    type: fileMimeType,
  } as any);
  formData.append('documentType', documentType);

  return uploadFile(API_ENDPOINTS.nurseUploadDocument, formData, token);
};
