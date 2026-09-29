import Stack from '@mui/material/Stack';
import { Download, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AppButton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { getInvoiceProvider } from '../../services/clientInvoiceProvider';
import type { Booking } from '../../types/bookingRecord';
import { buildBookingInvoice } from '../../utils/buildBookingInvoice';
import { BookingInvoiceDocument } from './BookingInvoiceDocument';

export interface BookingInvoiceViewProps {
  booking: Booking;
}

export function BookingInvoiceView({ booking }: BookingInvoiceViewProps) {
  const [searchParams] = useSearchParams();
  const shouldAutoPrint = searchParams.get('print') === '1';
  const invoice = buildBookingInvoice(booking);
  const provider = getInvoiceProvider();

  useEffect(() => {
    if (!shouldAutoPrint) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [shouldAutoPrint]);

  const handleDownload = () => {
    void provider.deliver(booking, { mode: 'download' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        useFlexGap
        sx={{
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          '@media print': { display: 'none' },
        }}
      >
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.bookingDetail(booking.reference)}
          variant="outlined"
        >
          Back to booking
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<Download size={18} aria-hidden />}
          onClick={handleDownload}
        >
          Download
        </AppButton>
        <AppButton
          variant="contained"
          startIcon={<Printer size={18} aria-hidden />}
          onClick={handlePrint}
        >
          Print invoice
        </AppButton>
      </Stack>

      <BookingInvoiceDocument invoice={invoice} />
    </Stack>
  );
}