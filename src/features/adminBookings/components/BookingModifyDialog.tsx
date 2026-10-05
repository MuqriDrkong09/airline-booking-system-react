import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { AppAlert, AppButton, AppDialog, AppInput } from '@/components/common';
import type { AdminBooking, AdminBookingModifyInput } from '../types/adminBooking';

export interface BookingModifyDialogProps {
  open: boolean;
  booking: AdminBooking | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: AdminBookingModifyInput) => void | Promise<void>;
}

export function BookingModifyDialog({
  open,
  booking,
  submitting = false,
  onClose,
  onSubmit,
}: BookingModifyDialogProps) {
  const primary = booking?.passengers[0];
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && primary) {
      setEmail(primary.email);
      setPhone(primary.phone);
      setError(null);
    }
  }, [open, primary]);

  const handleSave = async () => {
    setError(null);
    try {
      await onSubmit({
        contactEmail: email.trim(),
        contactPhone: phone.trim(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to modify this booking.',
      );
    }
  };

  return (
    <AppDialog
      open={open}
      title={booking ? `Modify ${booking.reference}` : 'Modify booking'}
      onClose={onClose}
      maxWidth="sm"
      actions={
        <>
          <AppButton onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton variant="contained" loading={submitting} onClick={() => void handleSave()}>
            Save changes
          </AppButton>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Update the primary passenger contact details for this booking. Seat, baggage, and
          flight changes remain available through the customer manage flow.
        </Typography>
        {error ? (
          <AppAlert severity="error" onClose={() => setError(null)}>
            {error}
          </AppAlert>
        ) : null}
        <AppInput
          label="Contact email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />
        <AppInput
          label="Contact phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </Stack>
    </AppDialog>
  );
}
