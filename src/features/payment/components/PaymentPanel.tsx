import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert, AppButton } from '@/components/common';
import {
  formatBookingMoney,
  selectFinalTotal,
  useBookingStore,
  type PaymentMethod,
} from '@/features/booking';
import { useProcessPaymentMutation } from '../hooks/useProcessPayment';
import {
  cardFormSchema,
  emptyCardFormValues,
  type CardFormSchemaInput,
} from '../schemas/cardSchema';
import { isCardPaymentMethod, type PaymentUiStatus } from '../types/payment';
import {
  createBookingReference,
  createPaymentIdempotencyKey,
} from '../utils/paymentHelpers';
import { CardForm } from './CardForm';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentStatus } from './PaymentStatus';
import { PaymentSummary } from './PaymentSummary';

export interface PaymentPanelProps {
  flightId: string;
  summaryHref: string;
  bookingsHref: string;
}

export function PaymentPanel({ flightId, summaryHref, bookingsHref }: PaymentPanelProps) {
  const priceBreakdown = useBookingStore((state) => state.priceBreakdown);
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const passengers = useBookingStore((state) => state.passengers);
  const bookingReference = useBookingStore((state) => state.bookingReference);
  const setPayment = useBookingStore((state) => state.setPayment);
  const setBookingStatus = useBookingStore((state) => state.setBookingStatus);
  const setBookingReference = useBookingStore((state) => state.setBookingReference);
  const finalTotal = useBookingStore(selectFinalTotal);

  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [uiStatus, setUiStatus] = useState<PaymentUiStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(createPaymentIdempotencyKey());

  const mutation = useProcessPaymentMutation();

  const cardForm = useForm<CardFormSchemaInput>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: emptyCardFormValues,
    mode: 'onBlur',
  });

  const locked = uiStatus === 'PROCESSING' || uiStatus === 'SUCCESS';
  const showCardForm = isCardPaymentMethod(method);

  const flightLabel = selectedFlight
    ? `${selectedFlight.origin.code} → ${selectedFlight.destination.code} · ${selectedFlight.airline.name} ${selectedFlight.flightNumber}`
    : null;

  const resetForRetry = () => {
    submittingRef.current = false;
    idempotencyKeyRef.current = createPaymentIdempotencyKey();
    setUiStatus('IDLE');
    setStatusMessage(null);
    setTransactionId(null);
    setBookingStatus('PENDING_PAYMENT');
    mutation.reset();
  };

  const handlePay = cardForm.handleSubmit(async (cardValues) => {
    if (submittingRef.current || uiStatus === 'PROCESSING' || uiStatus === 'SUCCESS') {
      return;
    }

    submittingRef.current = true;
    setUiStatus('PROCESSING');
    setStatusMessage(null);
    setBookingStatus('PENDING_PAYMENT');

    try {
      const result = await mutation.mutateAsync({
        method,
        amount: finalTotal,
        currency: priceBreakdown.currency,
        flightId,
        idempotencyKey: idempotencyKeyRef.current,
        card: showCardForm
          ? {
              cardNumber: cardValues.cardNumber,
              cardHolder: cardValues.cardHolder,
              expiryDate: cardValues.expiryDate,
              cvv: cardValues.cvv,
            }
          : undefined,
      });

      // Drop sensitive card fields from memory as soon as the mock call returns.
      cardForm.reset(emptyCardFormValues);

      if (!result.ok) {
        setUiStatus('FAILED');
        setStatusMessage(result.message);
        setBookingStatus('FAILED');
        submittingRef.current = false;
        return;
      }

      setPayment({
        method: result.method,
        billingName: result.billingName,
        billingEmail: passengers[0]?.email ?? '',
        cardBrand: result.cardBrand,
        cardLast4: result.cardLast4,
      });

      const reference = createBookingReference(result.transactionId);
      setBookingReference(reference);
      setBookingStatus('CONFIRMED');
      setTransactionId(result.transactionId);
      setStatusMessage(result.message);
      setUiStatus('SUCCESS');
      // Keep submittingRef true after success to block duplicate posts.
    } catch {
      cardForm.reset(emptyCardFormValues);
      setUiStatus('FAILED');
      setStatusMessage('Unable to reach the payment service. Please try again.');
      setBookingStatus('FAILED');
      submittingRef.current = false;
    }
  });

  const handleNonCardPay = async () => {
    if (submittingRef.current || uiStatus === 'PROCESSING' || uiStatus === 'SUCCESS') {
      return;
    }

    submittingRef.current = true;
    setUiStatus('PROCESSING');
    setStatusMessage(null);
    setBookingStatus('PENDING_PAYMENT');

    try {
      const result = await mutation.mutateAsync({
        method,
        amount: finalTotal,
        currency: priceBreakdown.currency,
        flightId,
        idempotencyKey: idempotencyKeyRef.current,
      });

      if (!result.ok) {
        setUiStatus('FAILED');
        setStatusMessage(result.message);
        setBookingStatus('FAILED');
        submittingRef.current = false;
        return;
      }

      setPayment({
        method: result.method,
        billingName:
          result.billingName ||
          (passengers[0]
            ? `${passengers[0].firstName} ${passengers[0].lastName}`.trim()
            : ''),
        billingEmail: passengers[0]?.email ?? '',
        cardBrand: '',
        cardLast4: '',
      });

      const reference = createBookingReference(result.transactionId);
      setBookingReference(reference);
      setBookingStatus('CONFIRMED');
      setTransactionId(result.transactionId);
      setStatusMessage(result.message);
      setUiStatus('SUCCESS');
    } catch {
      setUiStatus('FAILED');
      setStatusMessage('Unable to reach the payment service. Please try again.');
      setBookingStatus('FAILED');
      submittingRef.current = false;
    }
  };

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
      <Stack spacing={2.5}>
        <PaymentMethodSelector
          value={method}
          onChange={(next) => {
            if (locked) {
              return;
            }
            setMethod(next);
            setUiStatus('IDLE');
            setStatusMessage(null);
          }}
          disabled={locked}
        />

        {showCardForm && uiStatus !== 'SUCCESS' ? (
          <FormProvider {...cardForm}>
            <Stack
              component="form"
              spacing={2.5}
              onSubmit={(event) => {
                event.preventDefault();
                void handlePay();
              }}
              noValidate
            >
              <CardForm disabled={locked} />
              <AppAlert severity="info" title="Mock payment only">
                No real charges are made. Card details stay in memory for this request and are
                never written to localStorage.
              </AppAlert>
              {uiStatus !== 'FAILED' ? (
                <AppButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={uiStatus === 'PROCESSING'}
                  loadingLabel="Processing…"
                  disabled={locked || finalTotal <= 0}
                >
                  Pay {formatBookingMoney(finalTotal, priceBreakdown.currency)}
                </AppButton>
              ) : null}
            </Stack>
          </FormProvider>
        ) : null}

        {!showCardForm && uiStatus !== 'SUCCESS' && uiStatus !== 'FAILED' ? (
          <Stack spacing={2}>
            <AppAlert severity="info" title={`${method === 'FPX' ? 'FPX' : 'E-wallet'} checkout`}>
              This mock flow simulates an external {method === 'FPX' ? 'bank' : 'wallet'} redirect
              without leaving AeroBook.
            </AppAlert>
            <AppButton
              variant="contained"
              size="large"
              loading={uiStatus === 'PROCESSING'}
              loadingLabel="Processing…"
              disabled={locked || finalTotal <= 0}
              onClick={() => {
                void handleNonCardPay();
              }}
            >
              Pay {formatBookingMoney(finalTotal, priceBreakdown.currency)}
            </AppButton>
          </Stack>
        ) : null}

        <PaymentStatus
          status={uiStatus}
          message={statusMessage}
          transactionId={transactionId}
          bookingReference={bookingReference}
          onRetry={uiStatus === 'FAILED' ? resetForRetry : undefined}
        />

        {uiStatus === 'SUCCESS' ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <AppButton component={RouterLink} to={bookingsHref} variant="contained">
              View bookings
            </AppButton>
            <AppButton component={RouterLink} to={summaryHref} variant="outlined">
              Back to summary
            </AppButton>
          </Stack>
        ) : null}
      </Stack>

      <Stack spacing={2.5}>
        <PaymentSummary
          breakdown={priceBreakdown}
          method={method}
          flightLabel={flightLabel}
          passengerCount={passengers.length}
        />
        {uiStatus === 'IDLE' || uiStatus === 'PROCESSING' ? (
          <Typography variant="caption" color="text.secondary">
            By paying you agree to AeroBook’s fare rules for this mock booking.
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
