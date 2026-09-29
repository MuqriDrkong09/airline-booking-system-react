import Stack from '@mui/material/Stack';
import { Download, Printer, Ticket } from 'lucide-react';
import { useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AppButton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { Booking } from '../../types/bookingRecord';
import {
  buildBookingETickets,
  formatETicketAsText,
} from '../../utils/buildBookingETicket';
import { downloadTextFile } from '../../utils/bookingDocuments';
import { BookingETicketDocument } from './BookingETicketDocument';

export interface BookingETicketViewProps {
  booking: Booking;
}

export function BookingETicketView({ booking }: BookingETicketViewProps) {
  const [searchParams] = useSearchParams();
  const shouldAutoPrint = searchParams.get('print') === '1';
  const tickets = buildBookingETickets(booking);

  useEffect(() => {
    if (!shouldAutoPrint) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [shouldAutoPrint]);

  const handleDownload = () => {
    downloadTextFile(
      `aerobook-eticket-${booking.reference}.txt`,
      formatETicketAsText(tickets),
    );
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
          startIcon={<Ticket size={18} aria-hidden />}
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
          onClick={() => window.print()}
        >
          Print e-ticket
        </AppButton>
      </Stack>

      <Stack spacing={2.5}>
        {tickets.map((ticket) => (
          <BookingETicketDocument key={ticket.passengerId} ticket={ticket} />
        ))}
      </Stack>
    </Stack>
  );
}
