import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PAYMENT_METHOD_LABELS } from '@/features/payment';
import type { BookingInvoice } from '../../types/invoice';
import { formatBookingTimestamp } from '../../utils/bookingDetailHelpers';
import { INVOICE_PAYMENT_STATUS_LABELS } from '../../utils/buildBookingInvoice';
import { formatBookingMoney } from '../../utils/formatMoney';

export interface BookingInvoiceDocumentProps {
  invoice: BookingInvoice;
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ChargeRow({
  label,
  amount,
  currency,
  emphasize,
  negative,
}: {
  label: string;
  amount: number;
  currency: string;
  emphasize?: boolean;
  negative?: boolean;
}) {
  const display =
    negative && amount > 0
      ? `−${formatBookingMoney(amount, currency)}`
      : formatBookingMoney(amount, currency);

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ py: 0.5, justifyContent: 'space-between' }}
    >
      <Typography
        variant="body2"
        color={emphasize ? 'text.primary' : 'text.secondary'}
        sx={{ fontWeight: emphasize ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: emphasize ? 700 : 500, fontVariantNumeric: 'tabular-nums' }}
      >
        {display}
      </Typography>
    </Stack>
  );
}

/**
 * Printable invoice paper layout.
 * Renders from the structured `BookingInvoice` DTO so a future PDF renderer
 * can reuse the same field set.
 */
export function BookingInvoiceDocument({ invoice }: BookingInvoiceDocumentProps) {
  const paymentMethodLabel = invoice.paymentMethod
    ? PAYMENT_METHOD_LABELS[invoice.paymentMethod]
    : '—';

  return (
    <Box
      component="article"
      aria-label={`Invoice ${invoice.invoiceNumber}`}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 2.5, sm: 4 },
        width: '100%',
        boxSizing: 'border-box',
        '@media print': {
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          p: 0,
          m: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          gap: 2,
          mb: 3,
          width: '100%',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
          >
            AeroBook
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Tax invoice / receipt
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: { xs: 'left', sm: 'right' },
            ml: { sm: 'auto' },
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h5"
            component="p"
            sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {invoice.invoiceNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Issued {formatBookingTimestamp(invoice.issuedAt)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          mb: 3,
          width: '100%',
        }}
      >
        <MetaCell label="Booking reference" value={invoice.bookingReference} />
        <MetaCell
          label="Payment status"
          value={INVOICE_PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
        />
        <MetaCell
          label="Payment date"
          value={formatBookingTimestamp(invoice.paymentDate)}
        />
        <MetaCell label="Payment method" value={paymentMethodLabel} />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          mb: 3,
          width: '100%',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Bill to
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {invoice.billingName}
          </Typography>
          {invoice.billingEmail ? (
            <Typography variant="body2" color="text.secondary">
              {invoice.billingEmail}
            </Typography>
          ) : null}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Transaction {invoice.transactionId}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Passenger{invoice.passengers.length === 1 ? '' : 's'}
          </Typography>
          <Stack spacing={0.5} component="ul" sx={{ m: 0, pl: 2 }}>
            {invoice.passengers.map((passenger) => (
              <Typography key={passenger.id} component="li" variant="body2">
                {passenger.name}
                <Typography component="span" variant="body2" color="text.secondary">
                  {` · ${passenger.type}`}
                </Typography>
              </Typography>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 1 }}
        >
          Flight
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {invoice.flight.airline} {invoice.flight.flightNumber}
        </Typography>
        <Typography variant="body2">
          {invoice.flight.route} · {invoice.flight.routeCities}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Departs {formatBookingTimestamp(invoice.flight.departureTime)} · Arrives{' '}
          {formatBookingTimestamp(invoice.flight.arrivalTime)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cabin: {invoice.flight.cabinClass}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 1 }}
      >
        Charges
      </Typography>

      <ChargeRow label="Fare" amount={invoice.fare} currency={invoice.currency} />
      <ChargeRow label="Seats" amount={invoice.seats} currency={invoice.currency} />
      <ChargeRow label="Baggage" amount={invoice.baggage} currency={invoice.currency} />
      <ChargeRow label="Meals" amount={invoice.meals} currency={invoice.currency} />
      <ChargeRow label="Add-ons" amount={invoice.addons} currency={invoice.currency} />

      <Divider sx={{ my: 1 }} />

      <ChargeRow
        label="Subtotal"
        amount={invoice.subtotal}
        currency={invoice.currency}
      />
      <ChargeRow
        label="Discount"
        amount={invoice.discount}
        currency={invoice.currency}
        negative
      />
      <ChargeRow label="Taxes" amount={invoice.taxes} currency={invoice.currency} />

      <Divider sx={{ my: 1.5 }} />

      <ChargeRow
        label="Total"
        amount={invoice.total}
        currency={invoice.currency}
        emphasize
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 4 }}
      >
        This is a demo invoice generated client-side. A backend PDF service can
        replace this layout using the same invoice fields.
      </Typography>
    </Box>
  );
}
