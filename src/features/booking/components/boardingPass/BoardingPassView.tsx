import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download, Printer, Ticket } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AppAlert, AppButton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { Booking } from '../../types/bookingRecord';
import {
  buildBoardingPasses,
  canViewBoardingPass,
  formatBoardingPassAsText,
} from '../../utils/buildBoardingPass';
import { downloadTextFile } from '../../utils/bookingDocuments';
import { BoardingPassCard } from './BoardingPassCard';

export interface BoardingPassViewProps {
  booking: Booking;
}

export function BoardingPassView({ booking }: BoardingPassViewProps) {
  const [searchParams] = useSearchParams();
  const shouldAutoPrint = searchParams.get('print') === '1';
  const passengerFilter = searchParams.get('passengerId')?.trim() ?? '';

  const allPasses = useMemo(() => buildBoardingPasses(booking), [booking]);
  const passes = useMemo(() => {
    if (!passengerFilter) {
      return allPasses;
    }
    return allPasses.filter((pass) => pass.passengerId === passengerFilter);
  }, [allPasses, passengerFilter]);

  const eligible = canViewBoardingPass(booking);

  useEffect(() => {
    if (!shouldAutoPrint || passes.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [passes.length, shouldAutoPrint]);

  const handleDownload = () => {
    downloadTextFile(
      `aerobook-boarding-pass-${booking.reference}.txt`,
      formatBoardingPassAsText(passes.length > 0 ? passes : allPasses),
    );
  };

  if (!eligible || allPasses.length === 0) {
    return (
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
        <AppAlert severity="info" title="Boarding pass not ready">
          Complete online check-in first. Boarding passes are issued for checked-in
          passengers only.
        </AppAlert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap>
          <AppButton
            component={RouterLink}
            to={`${APP_ROUTES.customer.checkIn}?reference=${encodeURIComponent(booking.reference)}`}
            variant="contained"
          >
            Go to check-in
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingDetail(booking.reference)}
            variant="outlined"
          >
            Back to booking
          </AppButton>
        </Stack>
      </Stack>
    );
  }

  if (passes.length === 0) {
    return (
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
        <AppAlert severity="warning" title="Passenger not found">
          No boarding pass matches the selected passenger on booking{' '}
          {booking.reference}.
        </AppAlert>
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.bookingBoardingPass(booking.reference)}
          variant="contained"
        >
          View all boarding passes
        </AppButton>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ width: '100%', alignItems: 'center' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        useFlexGap
        sx={{
          justifyContent: 'center',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          width: '100%',
          maxWidth: { xs: 420, sm: 560 },
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
          Print boarding pass
        </AppButton>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', '@media print': { display: 'none' } }}
      >
        {passes.length === 1
          ? 'Show this pass at security and the gate.'
          : `${passes.length} boarding passes — swipe or scroll on mobile.`}
      </Typography>

      <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
        {passes.map((pass) => (
          <BoardingPassCard key={pass.passengerId} pass={pass} />
        ))}
      </Stack>
    </Stack>
  );
}
