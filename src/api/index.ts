/**
 * Barrel export for the API layer.
 */
export { fetchApi, uploadFile } from './client';
export { sendOTP, verifyOTP, resendOTP } from './authApi';
export {
  getNurseBookings,
  getAvailableBookings,
  getBookingById,
  claimBooking,
  acceptBooking,
  rejectBooking,
  startService,
  endService,
  submitAdminChart,
  submitConsent,
  submitFeedback,
  getBookingInventory,
  updateExpenses,
  uploadExpenseReceipt,
  saveChecklist,
} from './bookingApi';
export {
  registerNurse,
  getNurseProfile,
  updateNurseProfile,
  uploadDocument,
} from './nurseApi';
