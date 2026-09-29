import Box from '@mui/material/Box';
import {
  CalendarPlus,
  Download,
  Eye,
  FileText,
  Printer,
  Ticket,
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppButton, AppCard } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { getInvoiceProvider } from '../../services/clientInvoiceProvider';
import type { Booking } from '../../types/bookingRecord';
import {
  buildETicketText,
  downloadCalendarEvent,
  downloadTextFile,
} from '../../utils/bookingDocuments';

export interface BookingConfirmationActionsProps {
  booking: Booking;
}

export function BookingConfirmationActions({ booking }: BookingConfirmationActionsProps) {
  const navigate = useNavigate();
  const invoiceProvider = getInvoiceProvider();

  return (
    <AppCard title="Actions" subtitle="Documents and next steps for this booking.">
      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          '& > *': { width: '100%' },
        }}
      >
        <AppButton
          variant="contained"
          startIcon={<Ticket size={18} aria-hidden />}
          component={RouterLink}
          to={APP_ROUTES.customer.bookingETicket(booking.reference)}
        >
          View e-ticket
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<Download size={18} aria-hidden />}
          onClick={() =>
            downloadTextFile(
              `aerobook-eticket-${booking.reference}.txt`,
              buildETicketText(booking),
            )
          }
        >
          Download e-ticket
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<Printer size={18} aria-hidden />}
          component={RouterLink}
          to={`${APP_ROUTES.customer.bookingETicket(booking.reference)}?print=1`}
        >
          Print e-ticket
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<FileText size={18} aria-hidden />}
          onClick={() => {
            void invoiceProvider.deliver(booking, {
              mode: 'view',
              navigate,
            });
          }}
        >
          View invoice
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<Download size={18} aria-hidden />}
          onClick={() => {
            void invoiceProvider.deliver(booking, { mode: 'download' });
          }}
        >
          Download invoice
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<Printer size={18} aria-hidden />}
          onClick={() => {
            void invoiceProvider.deliver(booking, {
              mode: 'print',
              navigate,
            });
          }}
        >
          Print invoice
        </AppButton>
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.bookingDetail(booking.reference)}
          variant="outlined"
          startIcon={<Eye size={18} aria-hidden />}
        >
          View booking
        </AppButton>
        <AppButton
          variant="outlined"
          startIcon={<CalendarPlus size={18} aria-hidden />}
          onClick={() => downloadCalendarEvent(booking)}
        >
          Add to calendar
        </AppButton>
      </Box>
    </AppCard>
  );
}
