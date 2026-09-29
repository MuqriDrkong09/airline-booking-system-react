import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PAYMENT_METHOD_LABELS } from '@/features/payment';
import type { Booking } from '../../types/bookingRecord';
import { formatBookingMoney } from '../../utils/formatMoney';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingPaymentDetailProps {
  booking: Booking;
}

export function BookingPaymentDetail({ booking }: BookingPaymentDetailProps) {
  const { payment, priceBreakdown } = booking;

  return (
    <BookingDetailSection
      title="Payment"
      subtitle="Safe payment snapshot — no card secrets stored."
    >
      <Stack spacing={1}>
        <MoneyRow
          label="Method"
          value={
            [
              payment.method ? PAYMENT_METHOD_LABELS[payment.method] : null,
              payment.cardBrand || null,
              payment.cardLast4 ? `•••• ${payment.cardLast4}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'
          }
        />
        {payment.billingName ? (
          <MoneyRow
            label="Billed to"
            value={`${payment.billingName}${payment.billingEmail ? ` · ${payment.billingEmail}` : ''}`}
          />
        ) : null}
        {booking.promoCode ? (
          <MoneyRow
            label="Promo"
            value={`${booking.promoCode.code}${
              booking.promoCode.description ? ` · ${booking.promoCode.description}` : ''
            }`}
          />
        ) : null}
        <Divider />
        <MoneyRow
          label="Fare"
          value={formatBookingMoney(priceBreakdown.baseFare, priceBreakdown.currency)}
        />
        <MoneyRow
          label="Seats"
          value={formatBookingMoney(priceBreakdown.seatCost, priceBreakdown.currency)}
        />
        <MoneyRow
          label="Baggage"
          value={formatBookingMoney(priceBreakdown.baggageCost, priceBreakdown.currency)}
        />
        <MoneyRow
          label="Meals"
          value={formatBookingMoney(priceBreakdown.mealCost, priceBreakdown.currency)}
        />
        <MoneyRow
          label="Add-ons"
          value={formatBookingMoney(priceBreakdown.addonCost, priceBreakdown.currency)}
        />
        <MoneyRow
          label="Discount"
          value={
            priceBreakdown.discount > 0
              ? `−${formatBookingMoney(priceBreakdown.discount, priceBreakdown.currency)}`
              : formatBookingMoney(0, priceBreakdown.currency)
          }
        />
        <MoneyRow
          label="Taxes"
          value={formatBookingMoney(priceBreakdown.taxes, priceBreakdown.currency)}
        />
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total paid
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatBookingMoney(priceBreakdown.finalTotal, priceBreakdown.currency)}
          </Typography>
        </Stack>
      </Stack>
    </BookingDetailSection>
  );
}

function MoneyRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}
