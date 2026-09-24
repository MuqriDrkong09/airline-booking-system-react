import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppCard } from '@/components/common';
import { ADDON_CATALOG, formatAddonPrice, getAddonById } from '@/features/addons';
import { formatBaggageWeight } from '@/features/baggage';
import {
  formatCabinLabel,
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatStopsLabel,
} from '@/features/flights';
import { MEAL_TYPE_LABELS } from '@/features/meals';
import { PASSENGER_TYPE_LABELS } from '@/features/passengers';
import { PAYMENT_METHOD_LABELS } from '@/features/payment';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatBookingMoney } from '../../utils/formatMoney';

export interface BookingConfirmationDetailsProps {
  booking: Booking;
}

function passengerLabel(passenger: BookingPassenger): string {
  const name = `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
  return name || passenger.id;
}

function nameById(booking: Booking): Map<string, string> {
  return new Map(
    booking.passengers.map((passenger) => [passenger.id, passengerLabel(passenger)]),
  );
}

export function BookingConfirmationDetails({ booking }: BookingConfirmationDetailsProps) {
  const { flight, priceBreakdown, payment } = booking;
  const names = nameById(booking);
  const seatByPassenger = new Map(booking.seats.map((seat) => [seat.passengerId, seat]));
  const mealByPassenger = new Map(booking.meals.map((item) => [item.passengerId, item]));

  return (
    <Stack spacing={2.5} id="booking-confirmation-print">
      <AppCard title="Flight details" subtitle={`${flight.airline.name} ${flight.flightNumber}`}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <AppBadge label={formatCabinLabel(booking.cabinClass)} tone="info" variant="outlined" />
            <AppBadge
              label={formatStopsLabel(flight.stops, flight.stopAirports)}
              tone="default"
              variant="outlined"
            />
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {flight.origin.code} → {flight.destination.code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flight.origin.city} to {flight.destination.city}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatFlightDate(flight.departureTime)} · {formatFlightTime(flight.departureTime)}–
            {formatFlightTime(flight.arrivalTime)} · {formatDuration(flight.durationMinutes)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flight.origin.airportName}
            {flight.origin.terminal ? ` · Terminal ${flight.origin.terminal}` : ''}
            {' → '}
            {flight.destination.airportName}
            {flight.destination.terminal ? ` · Terminal ${flight.destination.terminal}` : ''}
          </Typography>
        </Stack>
      </AppCard>

      <AppCard
        title="Passengers"
        subtitle={`${booking.passengers.length} traveler${booking.passengers.length === 1 ? '' : 's'}`}
      >
        <Stack spacing={1.5}>
          {booking.passengers.map((passenger) => (
            <Stack key={passenger.id} spacing={0.25}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle2">{passengerLabel(passenger)}</Typography>
                <AppBadge
                  label={PASSENGER_TYPE_LABELS[passenger.type]}
                  size="small"
                  tone="default"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {[
                  passenger.dateOfBirth ? `DOB ${passenger.dateOfBirth}` : null,
                  passenger.nationality || null,
                  passenger.email || null,
                  passenger.phone || null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </AppCard>

      <AppCard title="Seats" subtitle="Assigned seat numbers">
        <Stack spacing={1}>
          {booking.passengers.filter((passenger) => passenger.type !== 'INFANT').length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No seat-eligible passengers.
            </Typography>
          ) : (
            booking.passengers
              .filter((passenger) => passenger.type !== 'INFANT')
              .map((passenger) => {
                const seat = seatByPassenger.get(passenger.id);
                return (
                  <Stack
                    key={passenger.id}
                    direction="row"
                    sx={{ justifyContent: 'space-between', gap: 1 }}
                  >
                    <Typography variant="body2">{passengerLabel(passenger)}</Typography>
                    <Typography variant="subtitle2">{seat?.label ?? '—'}</Typography>
                  </Stack>
                );
              })
          )}
          {booking.passengers.some((passenger) => passenger.type === 'INFANT') ? (
            <Typography variant="caption" color="text.secondary">
              Infants travel on an adult’s lap and are not assigned seats.
            </Typography>
          ) : null}
        </Stack>
      </AppCard>

      <AppCard title="Baggage" subtitle="Cabin, checked, and extra bags">
        <Stack spacing={1.25}>
          {booking.baggage.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No baggage selections recorded.
            </Typography>
          ) : (
            booking.baggage.map((selection) => (
              <Stack key={selection.passengerId} spacing={0.25}>
                <Typography variant="subtitle2">
                  {names.get(selection.passengerId) ?? selection.passengerId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cabin {formatBaggageWeight(selection.cabinKg)}
                  {selection.checkedKg > 0
                    ? ` · Checked ${formatBaggageWeight(selection.checkedKg)}`
                    : ' · No checked bag'}
                  {selection.additionalKg > 0
                    ? ` · Extra ${formatBaggageWeight(selection.additionalKg)}`
                    : ''}
                </Typography>
              </Stack>
            ))
          )}
        </Stack>
      </AppCard>

      <AppCard title="Meals" subtitle="Per-passenger meal choices">
        <Stack spacing={1.25}>
          {booking.passengers.map((passenger) => {
            const selection = mealByPassenger.get(passenger.id);
            const label =
              passenger.type === 'INFANT'
                ? 'No meal'
                : selection?.mealType
                  ? `${MEAL_TYPE_LABELS[selection.mealType]} × ${selection.quantity}`
                  : 'No meal selected';
            return (
              <Stack key={passenger.id} spacing={0.25}>
                <Typography variant="subtitle2">{passengerLabel(passenger)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </AppCard>

      <AppCard title="Add-ons" subtitle="Optional extras on this booking">
        <Stack spacing={1.25}>
          {booking.addons.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No add-ons selected.
            </Typography>
          ) : (
            booking.addons.map((selection) => {
              const addon = getAddonById(selection.addonId, ADDON_CATALOG);
              if (!addon) {
                return null;
              }
              return (
                <Stack
                  key={`${selection.passengerId}-${selection.addonId}`}
                  direction="row"
                  sx={{ justifyContent: 'space-between', gap: 1 }}
                >
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {addon.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {names.get(selection.passengerId) ?? selection.passengerId}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{formatAddonPrice(addon.price)}</Typography>
                </Stack>
              );
            })
          )}
        </Stack>
      </AppCard>

      <AppCard title="Payment summary" subtitle="Safe payment snapshot — no card secrets stored.">
        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Method
            </Typography>
            <Typography variant="body2">
              {payment.method ? PAYMENT_METHOD_LABELS[payment.method] : '—'}
              {payment.cardBrand ? ` · ${payment.cardBrand}` : ''}
              {payment.cardLast4 ? ` ·•••• ${payment.cardLast4}` : ''}
            </Typography>
          </Stack>
          {payment.billingName ? (
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Billed to
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'right' }}>
                {payment.billingName}
                {payment.billingEmail ? ` · ${payment.billingEmail}` : ''}
              </Typography>
            </Stack>
          ) : null}
          <Divider />
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Fare
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.baseFare, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Seats
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.seatCost, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Baggage
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.baggageCost, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Meals
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.mealCost, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Add-ons
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.addonCost, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Discount
            </Typography>
            <Typography variant="body2">
              {priceBreakdown.discount > 0
                ? `−${formatBookingMoney(priceBreakdown.discount, priceBreakdown.currency)}`
                : formatBookingMoney(0, priceBreakdown.currency)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Taxes
            </Typography>
            <Typography variant="body2">
              {formatBookingMoney(priceBreakdown.taxes, priceBreakdown.currency)}
            </Typography>
          </Stack>
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
      </AppCard>
    </Stack>
  );
}
