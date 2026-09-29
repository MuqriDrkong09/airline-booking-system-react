import { APP_ROUTES } from '@/constants/routes';
import type { Booking } from '../types/bookingRecord';
import { downloadTextFile } from '../utils/bookingDocuments';
import {
  buildBookingInvoice,
  formatInvoiceAsText,
} from '../utils/buildBookingInvoice';
import type {
  InvoiceArtifact,
  InvoiceDeliveryMode,
  InvoiceProvider,
} from './invoiceProvider';

function invoiceFilename(booking: Booking, extension: string): string {
  return `aerobook-invoice-${booking.reference}.${extension}`;
}

/**
 * Client-side invoice provider.
 *
 * Uses structured invoice data + printable React route for view/print,
 * and a plain-text download until a backend PDF endpoint exists.
 *
 * To switch to backend PDFs later:
 * 1. Implement `ApiPdfInvoiceProvider` that POSTs/GETs a PDF blob
 * 2. Register it in `getInvoiceProvider()`
 * 3. Keep returning the same `BookingInvoice` DTO from `createInvoice`
 */
export class ClientInvoiceProvider implements InvoiceProvider {
  createInvoice(booking: Booking) {
    return buildBookingInvoice(booking);
  }

  async getArtifact(booking: Booking): Promise<InvoiceArtifact> {
    const invoice = this.createInvoice(booking);
    const text = formatInvoiceAsText(invoice);
    return {
      invoice,
      mimeType: 'text/plain',
      filename: invoiceFilename(booking, 'txt'),
      blob: new Blob([text], { type: 'text/plain;charset=utf-8' }),
    };
  }

  async deliver(
    booking: Booking,
    options: {
      mode: InvoiceDeliveryMode;
      navigate?: (path: string) => void;
    },
  ): Promise<void> {
    const invoicePath = APP_ROUTES.customer.bookingInvoice(booking.reference);

    if (options.mode === 'download') {
      const artifact = await this.getArtifact(booking);
      const text = formatInvoiceAsText(artifact.invoice);
      downloadTextFile(artifact.filename, text, artifact.mimeType);
      return;
    }

    if (options.navigate) {
      options.navigate(
        options.mode === 'print' ? `${invoicePath}?print=1` : invoicePath,
      );
      return;
    }

    if (typeof window !== 'undefined') {
      const url =
        options.mode === 'print' ? `${invoicePath}?print=1` : invoicePath;
      window.location.assign(url);
    }
  }
}

let activeProvider: InvoiceProvider = new ClientInvoiceProvider();

/** Active invoice provider — swap via `setInvoiceProvider` when PDF API ships. */
export function getInvoiceProvider(): InvoiceProvider {
  return activeProvider;
}

/** Test / migration hook to replace the client provider with a PDF provider. */
export function setInvoiceProvider(provider: InvoiceProvider): void {
  activeProvider = provider;
}

export function resetInvoiceProvider(): void {
  activeProvider = new ClientInvoiceProvider();
}
