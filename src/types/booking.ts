/**
 * TypeScript types for Bookings in the Nurse App.
 * Maps to the MongoDB Booking schema + nurse-specific extensions.
 */
import type { Address } from './auth';

// ── Booking Status Flow ─────────────────────────────────────────────────────
export type BookingStatus =
  | 'pending'          // Customer placed, awaiting nurse assignment
  | 'assigned'         // Assigned to this nurse, awaiting accept/reject
  | 'accepted'         // Nurse accepted
  | 'in_progress'      // Service started (start OTP verified)
  | 'completed'        // Service ended (end OTP verified)
  | 'cancelled'        // Customer or nurse cancelled
  | 'rejected';        // Nurse rejected → reassign

export type PaymentStatus = 'pending' | 'paid' | 'failed';

// ── Customer Snapshot (visible to nurse) ────────────────────────────────────
export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  age?: number;
  sex?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: Address;
  };
}

// ── Inventory / Kit Item ────────────────────────────────────────────────────
export interface InventoryItem {
  name: string;
  quantity: number;
  unit: string;
  isAvailable: boolean;
}

// ── Booking ─────────────────────────────────────────────────────────────────
export interface Booking {
  _id: string;
  user: string | CustomerInfo;        // populated or just ID
  nurse?: string;                     // Nurse ID
  service: string;                    // ObjectId ref
  serviceId: string;
  serviceTitle: string;
  serviceCategory?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  address: Address;
  notes?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  startOtp?: string;                  // generated when nurse arrives
  endOtp?: string;                    // generated when service ending
  startedAt?: string;
  completedAt?: string;
  inventory?: InventoryItem[];
  adminChart?: AdminChart;
  consentSigned?: boolean;
  feedback?: NurseFeedback;
  createdAt: string;
  updatedAt: string;
}

// ── Admin Chart (vitals + notes) ────────────────────────────────────────────
export interface AdminChart {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  weight?: number;
  notes: string;
  recordedAt: string;
}

// ── Nurse Feedback ──────────────────────────────────────────────────────────
export interface NurseFeedback {
  rating: number;               // 1-5
  comments: string;
  submittedAt: string;
}

// ── Request Card Display ────────────────────────────────────────────────────
export interface BookingCardData {
  id: string;
  location: string;             // e.g. "Borivli"
  service: string;              // e.g. "NAD"
  time: string;                 // e.g. "3 PM"
  date: string;                 // e.g. "12 May"
  status: BookingStatus;
}
