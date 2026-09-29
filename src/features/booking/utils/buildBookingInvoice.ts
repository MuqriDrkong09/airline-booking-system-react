import { formatCabinLabel } from '@/features/flights';
import { PASSENGER_TYPE_LABELS } from '@/features/passengers';
import type { Booking } from '../types/bookingRecord';
import type {
  BookingInvoice,
  InvoiceMoneyLine,
  InvoicePaymentStatus,
} from '../types/invoice';

export const INVOICE_PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
};

export function deriveInvoicePaymentStatus(booking: Booking): InvoicePaymentStatus {
  switch (booking.status) {
    case 'REFUNDED':
      return 'REFUNDED';
    case 'CANCELLED':
    case 'CANCELLATION_REQUESTED':
      return booking.cancellation && booking.cancellation.refundAmount > 0
        ? 'REFUNDED'
        : 'PAID';
    case 'PENDING':
      return 'PENDING';
    case 'CONFIRMED':
    case 'CHECKED_IN':
    case 'COMPLETED':
      return 'PAID';
    default:
      return 'PENDING';
  }
}

export function generateInvoiceNumber(booking: Booking): string {
  const compactRef = booking.reference.replace(/[^A-Z0-9]/gi, '');
  return `INV-${compactRef || booking.id.slice(0, 8).toUpperCase()}`;
}

function passengerDisplayName(booking: Booking): string {
  const primary = booking.passengers[0];
  if (!primary) {
    return 'Passenger';
  }
  return `${primary.title} ${primary.firstName} ${primary.lastName}`.trim() || 'Passenger';
}

/**
 * Builds a structured invoice from a persisted booking.
 * Pure and side-effect free — safe for tests and future server reuse.
 */
export function buildBookingInvoice(booking: Booking): BookingInvoice {
  const { priceBreakdown, payment, flight } = booking;
  const currency = priceBreakdown.currency;

  const chargeLines: InvoiceMoneyLine[] = [
    { label: 'Fare', amount: priceBreakdown.baseFare },
    { label: 'Seats', amount: priceBreakdown.seatCost },
    { label: 'Baggage', amount: priceBreakdown.baggageCost },
    { label: 'Meals', amount: priceBreakdown.mealCost },
    { label: 'Add-ons', amount: priceBreakdown.addonCost },
  ];

  return {
    invoiceNumber: generateInvoiceNumber(booking),
    bookingReference: booking.reference,
    issuedAt: booking.createdAt,
    bookingStatus: booking.status,
    passengers: booking.passengers.map((passenger) => ({
      id: passenger.id,
      name: `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim(),
      type: PASSENGER_TYPE_LABELS[passenger.type] ?? passenger.type,
    })),
    flight: {
      airline: flight.airline.name,
      flightNumber: flight.flightNumber,
      route: `${flight.origin.code} → ${flight.destination.code}`,
      routeCities: `${flight.origin.city} to ${flight.destination.city}`,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      cabinClass: formatCabinLabel(booking.cabinClass),
    },
    fare: priceBreakdown.baseFare,
    baggage: priceBreakdown.baggageCost,
    meals: priceBreakdown.mealCost,
    addons: priceBreakdown.addonCost,
    seats: priceBreakdown.seatCost,
    subtotal: priceBreakdown.subtotal,
    taxes: priceBreakdown.taxes,
    discount: priceBreakdown.discount,
    total: priceBreakdown.finalTotal,
    currency,
    paymentStatus: deriveInvoicePaymentStatus(booking),
    paymentDate: booking.createdAt,
    paymentMethod: payment.method,
    billingName: payment.billingName || passengerDisplayName(booking),
    billingEmail: payment.billingEmail || booking.passengers[0]?.email || '',
    transactionId: booking.transactionId,
    chargeLines,
  };
}

/** Plain-text invoice for download / fallback when PDF is unavailable. */
export function formatInvoiceAsText(invoice: BookingInvoice): string {
  const money = (amount: number) =>
    `${invoice.currency} ${amount.toFixed(2)}`;

  const lines = [
    'AeroBook Invoice',
    '================',
    `Invoice number: ${invoice.invoiceNumber}`,
    `Booking reference: ${invoice.bookingReference}`,
    `Issued: ${invoice.issuedAt}`,
    '',
    'Bill to',
    `  ${invoice.billingName}`,
    `  ${invoice.billingEmail || '—'}`,
    '',
    'Passenger(s)',
    ...invoice.passengers.map(
      (passenger, index) => `  ${index + 1}. ${passenger.name} (${passenger.type})`,
    ),
    '',
    'Flight',
    `  ${invoice.flight.airline} ${invoice.flight.flightNumber}`,
    `  ${invoice.flight.route} · ${invoice.flight.routeCities}`,
    `  Departs ${invoice.flight.departureTime} · Arrives ${invoice.flight.arrivalTime}`,
    `  Cabin: ${invoice.flight.cabinClass}`,
    '',
    'Charges',
    `  Fare: ${money(invoice.fare)}`,
    `  Seats: ${money(invoice.seats)}`,
    `  Baggage: ${money(invoice.baggage)}`,
    `  Meals: ${money(invoice.meals)}`,
    `  Add-ons: ${money(invoice.addons)}`,
    `  Subtotal: ${money(invoice.subtotal)}`,
    `  Discount: ${money(invoice.discount)}`,
    `  Taxes: ${money(invoice.taxes)}`,
    `  Total: ${money(invoice.total)}`,
    '',
    `Payment status: ${INVOICE_PAYMENT_STATUS_LABELS[invoice.paymentStatus]}`,
    `Payment date: ${invoice.paymentDate}`,
    `Payment method: ${invoice.paymentMethod ?? '—'}`,
    `Transaction: ${invoice.transactionId}`,
    '',
    'This is a mock invoice for demo purposes only.',
  ];

  return lines.join('\n');
}
