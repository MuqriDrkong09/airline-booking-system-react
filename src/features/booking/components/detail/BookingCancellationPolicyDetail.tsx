import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import type { Booking } from '../../types/bookingRecord';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingCancellationPolicyDetailProps {
  booking: Booking;
}

export function BookingCancellationPolicyDetail({
  booking,
}: BookingCancellationPolicyDetailProps) {
  const { policies, refundable } = booking.flight;
  const conditions = policies.fareConditions.filter((item) => item.trim().length > 0);
  const hasContent =
    Boolean(policies.refundPolicy.trim()) ||
    Boolean(policies.changePolicy.trim()) ||
    conditions.length > 0;

  return (
    <BookingDetailSection
      title="Cancellation policy"
      subtitle="Refund and change rules for this fare"
      empty={!hasContent}
      emptyMessage="No cancellation policy was stored with this booking."
      action={
        <AppBadge
          label={refundable ? 'Refundable fare' : 'Non-refundable fare'}
          tone={refundable ? 'success' : 'warning'}
          variant="outlined"
        />
      }
    >
      <Stack spacing={1.5}>
        {policies.refundPolicy.trim() ? (
          <PolicyBlock label="Refund policy" body={policies.refundPolicy} />
        ) : null}
        {policies.changePolicy.trim() ? (
          <PolicyBlock label="Change policy" body={policies.changePolicy} />
        ) : null}
        {conditions.length > 0 ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Fare conditions</Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
              {conditions.map((condition) => (
                <Typography key={condition} component="li" variant="body2" color="text.secondary">
                  {condition}
                </Typography>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </BookingDetailSection>
  );
}

function PolicyBlock({ label, body }: { label: string; body: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
        {body}
      </Typography>
    </Stack>
  );
}
