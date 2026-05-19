/**
 * Booking API calls for the Nurse App.
 * Handles fetching assigned bookings, accept/reject, service execution OTPs,
 * admin chart, consent, and feedback submission.
 */
import { API_ENDPOINTS } from '../config/api';
import { fetchApi } from './client';
import type { Booking, AdminChart, NurseFeedback } from '../types/booking';

// ── Booking List ────────────────────────────────────────────────────────────

/** Fetch all bookings assigned to the authenticated nurse. */
export const getNurseBookings = async (
  token: string,
  status?: string,
): Promise<Booking[]> => {
  const query = status ? `?status=${status}` : '';
  return fetchApi<Booking[]>(`${API_ENDPOINTS.nurseBookings}${query}`, {
    token,
  });
};

/** Fetch available (unassigned) bookings that any nurse can claim. */
export const getAvailableBookings = async (
  token: string,
): Promise<Booking[]> => {
  return fetchApi<Booking[]>(API_ENDPOINTS.nurseAvailableBookings, {
    token,
  });
};

/** Fetch a single booking by ID with populated customer info. */
export const getBookingById = async (
  token: string,
  bookingId: string,
): Promise<Booking> => {
  const result = await fetchApi<Booking>(API_ENDPOINTS.nurseBookingById(bookingId), {
    token,
  });
  // ── DEBUG: log raw API response ──────────────────────────────────────────
  console.log('[getBookingById] RAW API RESPONSE:');
  console.log('  booking._id:', result._id);
  console.log('  booking.status:', result.status);
  console.log('  booking.user (typeof):', typeof result.user);
  console.log('  booking.user (value):', JSON.stringify(result.user, null, 2));
  console.log('  booking.address:', JSON.stringify(result.address, null, 2));
  // ── END DEBUG ─────────────────────────────────────────────────────────────
  return result;
};

// ── Claim ───────────────────────────────────────────────────────────────────

/** Claim (self-assign) an available booking. */
export const claimBooking = async (
  token: string,
  bookingId: string,
): Promise<{ success: boolean; booking: Booking }> => {
  return fetchApi(API_ENDPOINTS.nurseBookingClaim(bookingId), {
    method: 'POST',
    token,
  });
};

// ── Accept / Reject ─────────────────────────────────────────────────────────

export const acceptBooking = async (
  token: string,
  bookingId: string,
): Promise<{ success: boolean; booking: Booking }> => {
  return fetchApi(API_ENDPOINTS.nurseBookingAccept(bookingId), {
    method: 'POST',
    token,
  });
};

export const rejectBooking = async (
  token: string,
  bookingId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> => {
  return fetchApi(API_ENDPOINTS.nurseBookingReject(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  });
};

// ── Service Execution ───────────────────────────────────────────────────────

/** Verify START OTP to begin the service. */
export const startService = async (
  token: string,
  bookingId: string,
  otp: string,
): Promise<{ success: boolean; booking: Booking }> => {
  return fetchApi(API_ENDPOINTS.nurseServiceStart(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify({ otp }),
  });
};

/** Verify END OTP to complete the service. */
export const endService = async (
  token: string,
  bookingId: string,
  otp: string,
): Promise<{ success: boolean; booking: Booking }> => {
  return fetchApi(API_ENDPOINTS.nurseServiceEnd(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify({ otp }),
  });
};

// ── Admin Chart & Consent ───────────────────────────────────────────────────

export const submitAdminChart = async (
  token: string,
  bookingId: string,
  chart: Omit<AdminChart, 'recordedAt'>,
): Promise<{ success: boolean }> => {
  return fetchApi(API_ENDPOINTS.nurseAdminChart(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify(chart),
  });
};

export const submitConsent = async (
  token: string,
  bookingId: string,
  signatureData: string,
): Promise<{ success: boolean }> => {
  return fetchApi(API_ENDPOINTS.nurseConsent(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify({ signatureData, signed: true }),
  });
};

// ── Feedback ────────────────────────────────────────────────────────────────

export const submitFeedback = async (
  token: string,
  bookingId: string,
  feedback: Omit<NurseFeedback, 'submittedAt'>,
): Promise<{ success: boolean }> => {
  return fetchApi(API_ENDPOINTS.nurseFeedback(bookingId), {
    method: 'POST',
    token,
    body: JSON.stringify(feedback),
  });
};

// ── Inventory ───────────────────────────────────────────────────────────────

export const getBookingInventory = async (
  token: string,
  bookingId: string,
): Promise<{ inventory: Booking['inventory'] }> => {
  return fetchApi(API_ENDPOINTS.nurseInventory(bookingId), { token });
};
