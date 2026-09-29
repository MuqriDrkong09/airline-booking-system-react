import type { Booking } from '../types/bookingRecord';
import type { BookingInvoice } from '../types/invoice';

/**
 * Deliverable invoice artifact.
 * Today: text/plain (or printable HTML via the React page).
 * Later: application/pdf from a backend PDF service.
 */
export interface InvoiceArtifact {
  invoice: BookingInvoice;
  mimeType: string;
  filename: string;
  blob: Blob;
}

export type InvoiceDeliveryMode = 'view' | 'print' | 'download';

/**
 * Pluggable invoice delivery.
 * Replace `ClientInvoiceProvider` with an API/PDF implementation without
 * changing call sites — keep `createInvoice` JSON-compatible with the DTO.
 */
export interface InvoiceProvider {
  /** Build the structured invoice DTO from a booking snapshot. */
  createInvoice(booking: Booking): BookingInvoice;

  /**
   * Produce a downloadable artifact.
   * Client provider returns text; a future provider returns a PDF blob.
   */
  getArtifact(booking: Booking): Promise<InvoiceArtifact>;

  /**
   * Deliver the invoice to the user.
   * - view / print: navigate to the printable route (client) or open PDF (future)
   * - download: save the artifact locally
   */
  deliver(
    booking: Booking,
    options: {
      mode: InvoiceDeliveryMode;
      /** Navigate helper for view/print on the client provider. */
      navigate?: (path: string) => void;
    },
  ): Promise<void>;
}
