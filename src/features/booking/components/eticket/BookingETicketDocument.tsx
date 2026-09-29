import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { BookingETicket } from '../../types/eticket';
import { formatBookingTimestamp } from '../../utils/bookingDetailHelpers';
import { BookingETicketQr } from './BookingETicketQr';

export interface BookingETicketDocumentProps {
  ticket: BookingETicket;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Printable boarding-pass style e-ticket for a single passenger.
 */
export function BookingETicketDocument({ ticket }: BookingETicketDocumentProps) {
  return (
    <Box
      component="article"
      aria-label={`E-ticket ${ticket.bookingReference} · ${ticket.passengerName}`}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 2.5, sm: 3.5 },
        width: '100%',
        boxSizing: 'border-box',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        '@media print': {
          borderRadius: 0,
          boxShadow: 'none',
          p: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'flex-start' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                AeroBook
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Electronic ticket / boarding pass
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                Booking reference
              </Typography>
              <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
                {ticket.bookingReference}
              </Typography>
            </Box>
          </Stack>

          <Field label="Passenger" value={ticket.passengerName} />

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              mb: 2,
            }}
          >
            <Field label="Airline" value={ticket.airline} />
            <Field label="Flight number" value={ticket.flightNumber} />
            <Field
              label="Origin"
              value={`${ticket.originCode} · ${ticket.originCity} (${ticket.originAirport})`}
            />
            <Field
              label="Destination"
              value={`${ticket.destinationCode} · ${ticket.destinationCity} (${ticket.destinationAirport})`}
            />
            <Field label="Departure date" value={ticket.departureDate} />
            <Field label="Departure time" value={ticket.departureTime} />
            <Field label="Arrival time" value={ticket.arrivalTime} />
            <Field label="Seat" value={ticket.seat} />
          </Box>

          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 2,
              '@media print': {
                bgcolor: 'transparent',
                border: 1,
                borderColor: 'divider',
              },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 1 }}
            >
              Boarding information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, minmax(0, 1fr))',
                },
                mb: 1.5,
              }}
            >
              <Field
                label="Boarding opens"
                value={formatBookingTimestamp(ticket.boarding.boardingTime)}
              />
              <Field label="Gate" value={ticket.boarding.gate} />
              <Field label="Terminal" value={ticket.boarding.terminal} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ticket.boarding.instructions}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              Cabin: {ticket.cabinClass}
            </Typography>
          </Box>
        </Box>

        <Stack
          spacing={1}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            alignSelf: { xs: 'center', md: 'flex-start' },
            pt: { md: 0.5 },
          }}
        >
          <BookingETicketQr payload={ticket.qrPayload} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', maxWidth: 160 }}
          >
            Scan for booking ID only — no personal data encoded
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.04em',
            }}
          >
            {ticket.qrPayload}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
