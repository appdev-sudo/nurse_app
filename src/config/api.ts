/**
 * Backend API configuration.
 * Points to the same Express backend as the Customer App.
 */
const getDefaultBaseUrl = () => {
  if (__DEV__) {
    return 'https://a2b0-2401-4900-1cab-bbdd-487-678f-a779-6737.ngrok-free.app';
  }
  return 'https://a2b0-2401-4900-1cab-bbdd-487-678f-a779-6737.ngrok-free.app';
};

export const API_BASE_URL = getDefaultBaseUrl();

export const API_ENDPOINTS = {
  // Health
  health: '/api/health',

  // ── Nurse Auth (Twilio OTP → creates Nurse, not User) ──────────────────
  phoneSendOTP: '/api/nurse/auth/send-otp',
  phoneVerifyOTP: '/api/nurse/auth/verify-otp',
  phoneResendOTP: '/api/nurse/auth/resend-otp',

  // ── Nurse-specific endpoints ──────────────────────────────────────────────
  // Registration & profile
  nurseRegister: '/api/nurse/register',
  nurseProfile: '/api/nurse/profile',
  nurseUploadDocument: '/api/nurse/documents/upload',
  nurseLogin: '/api/nurse/login',

  // Bookings
  nurseBookings: '/api/nurse/bookings',
  nurseAvailableBookings: '/api/nurse/bookings/available',
  nurseBookingById: (id: string) => `/api/nurse/bookings/${id}`,
  nurseBookingClaim: (id: string) => `/api/nurse/bookings/${id}/claim`,
  nurseBookingAccept: (id: string) => `/api/nurse/bookings/${id}/accept`,
  nurseBookingReject: (id: string) => `/api/nurse/bookings/${id}/reject`,

  // Service execution
  nurseServiceStart: (id: string) => `/api/nurse/bookings/${id}/start`,
  nurseServiceEnd: (id: string) => `/api/nurse/bookings/${id}/end`,
  nurseAdminChart: (id: string) => `/api/nurse/bookings/${id}/admin-chart`,
  nurseConsent: (id: string) => `/api/nurse/bookings/${id}/consent`,
  nurseFeedback: (id: string) => `/api/nurse/bookings/${id}/feedback`,

  // Inventory
  nurseInventory: (id: string) => `/api/nurse/bookings/${id}/inventory`,
} as const;
