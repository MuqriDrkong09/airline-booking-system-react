import type { BookingRecordStatus } from './bookingRecord';
import type { PaymentMethod } from './booking';

/** Invoice payment status shown on the document (separate from booking lifecycle). */
export type InvoicePaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';

export interface InvoicePassengerLine {
  id: string;
  name: string;
  type: string;
}

export interface InvoiceFlightLine {
  airline: string;
  flightNumber: string;
  route: string;
  routeCities: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
}

export interface InvoiceMoneyLine {
  label: string;
  amount: number;
}

/**
 * Structured invoice DTO — shared by the printable UI and any future PDF API.
 * Keep this JSON-serializable so a backend can return the same shape.
 */
export interface BookingInvoice {
  invoiceNumber: string;
  bookingReference: string;
  issuedAt: string;
  bookingStatus: BookingRecordStatus;
  passengers: InvoicePassengerLine[];
  flight: InvoiceFlightLine;
  fare: number;
  baggage: number;
  meals: number;
  addons: number;
  seats: number;
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: InvoicePaymentStatus;
  paymentDate: string;
  paymentMethod: PaymentMethod | null;
  billingName: string;
  billingEmail: string;
  transactionId: string;
  /** Optional line items for richer PDF layouts later. */
  chargeLines: InvoiceMoneyLine[];
}
