/**
 * Date & time formatting helpers for the Nurse App.
 */

/** Format ISO date to display string (e.g. "12 May 2026"). */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Format ISO date to short date (e.g. "12 May"). */
export function formatShortDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/** Format time slot string or ISO date to display time (e.g. "3 PM"). */
export function formatTime(timeSlot?: string): string {
  if (!timeSlot) return '';
  // If it's already a readable format like "3 PM", return as-is
  if (/^\d{1,2}\s*(AM|PM)$/i.test(timeSlot.trim())) {
    return timeSlot.trim();
  }

  // Try parsing as ISO date
  const date = new Date(timeSlot);
  if (!isNaN(date.getTime())) {
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes();
    return minutes > 0 ? `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}` : `${hours} ${ampm}`;
  }

  return timeSlot;
}

/** Extract city from full address for the compact booking card. */
export function extractCity(formattedAddress: string): string {
  if (!formattedAddress) return 'Unknown';

  // Try to extract city from comma-separated address
  const parts = formattedAddress.split(',').map(p => p.trim());
  // Usually city is the 2nd or 3rd part
  if (parts.length >= 3) return parts[parts.length - 3];
  if (parts.length >= 2) return parts[0];
  return formattedAddress;
}

/** Generate a unique nurse ID (client-side, for display during onboarding).
 *  The actual ID is assigned by the backend.
 */
export function generateTempNurseId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `VY-NURSE-${randomNum}`;
}
