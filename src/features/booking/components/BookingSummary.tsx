import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import { useBookingStore } from '../store/bookingStore';
import { AddonSummary } from './AddonSummary';
import { BaggageSummary } from './BaggageSummary';
import { FlightSummary } from './FlightSummary';
import { MealSummary } from './MealSummary';
import { PassengerSummary } from './PassengerSummary';
import { PriceBreakdown } from './PriceBreakdown';
import { SeatSummary } from './SeatSummary';

export interface BookingSummaryEditHrefs {
  flight: string;
  passengers: string;
  seats: string;
  baggage: string;
  meals: string;
  addons: string;
  payment: string;
}

export interface BookingSummaryProps {
  editHrefs: BookingSummaryEditHrefs;
}

export function BookingSummary({ editHrefs }: BookingSummaryProps) {
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const passengers = useBookingStore((state) => state.passengers);
  const seats = useBookingStore((state) => state.seats);
  const baggage = useBookingStore((state) => state.baggage);
  const meals = useBookingStore((state) => state.meals);
  const addons = useBookingStore((state) => state.addons);
  const baggageTotal = useBookingStore((state) => state.baggageTotal);
  const mealTotal = useBookingStore((state) => state.mealTotal);
  const addonTotal = useBookingStore((state) => state.addonTotal);
  const priceBreakdown = useBookingStore((state) => state.priceBreakdown);
  const promoCode = useBookingStore((state) => state.promoCode);

  const [confirmed, setConfirmed] = useState(false);

  const currency = priceBreakdown.currency;
  const canPay = Boolean(selectedFlight && passengers.length > 0 && confirmed);

  return (
    <Stack spacing={2.5}>
      <BoxGrid>
        <Stack spacing={2.5}>
          <FlightSummary flight={selectedFlight} editTo={editHrefs.flight} />
          <PassengerSummary passengers={passengers} editTo={editHrefs.passengers} />
          <SeatSummary
            seats={seats}
            passengers={passengers}
            currency={currency}
            editTo={editHrefs.seats}
          />
          <BaggageSummary
            baggage={baggage}
            passengers={passengers}
            baggageTotal={baggageTotal}
            currency={currency}
            editTo={editHrefs.baggage}
          />
          <MealSummary
            meals={meals}
            passengers={passengers}
            mealTotal={mealTotal}
            currency={currency}
            editTo={editHrefs.meals}
          />
          <AddonSummary
            addons={addons}
            passengers={passengers}
            addonTotal={addonTotal}
            currency={currency}
            editTo={editHrefs.addons}
          />
        </Stack>

        <Stack spacing={2.5}>
          <PriceBreakdown
            breakdown={priceBreakdown}
            promoCode={promoCode?.code ?? null}
          />

          <AppCard title="Confirm booking" subtitle="Review everything before payment.">
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    slotProps={{
                      input: { 'aria-label': 'Confirm booking details before payment' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    I confirm that the flight, passenger, seat, baggage, meal, and add-on
                    details above are correct.
                  </Typography>
                }
              />

              {!confirmed ? (
                <AppAlert severity="info" title="Confirmation required">
                  Check the box above to continue to payment.
                </AppAlert>
              ) : null}

              <AppButton
                component={RouterLink}
                to={editHrefs.payment}
                variant="contained"
                fullWidth
                disabled={!canPay}
              >
                Continue to payment
              </AppButton>
            </Stack>
          </AppCard>
        </Stack>
      </BoxGrid>
    </Stack>
  );
}

function BoxGrid({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2.5}
      sx={{
        alignItems: 'stretch',
        '& > *': { minWidth: 0 },
        '& > :first-of-type': { flex: '1 1 0' },
        '& > :last-of-type': { flex: '0 1 360px', width: { lg: 360 } },
      }}
    >
      {children}
    </Stack>
  );
}
