import { AppButton, AppDialog } from '@/components/common';
import type { FlightFormParsedValues } from '../schemas/flightFormSchema';
import type { AdminFlight } from '../types/adminFlight';
import { FlightForm } from './FlightForm';

export interface FlightDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  flight?: AdminFlight | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FlightFormParsedValues) => void | Promise<void>;
}

const FORM_ID = 'admin-flight-form';

export function FlightDialog({
  open,
  mode,
  flight = null,
  submitting = false,
  onClose,
  onSubmit,
}: FlightDialogProps) {
  const title = mode === 'create' ? 'Create flight' : `Edit ${flight?.flightNumber ?? 'flight'}`;

  return (
    <AppDialog
      open={open}
      title={title}
      onClose={onClose}
      maxWidth="md"
      actions={
        <>
          <AppButton onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form={FORM_ID}
            variant="contained"
            loading={submitting}
            loadingLabel={mode === 'create' ? 'Creating' : 'Saving'}
          >
            {mode === 'create' ? 'Create flight' : 'Save changes'}
          </AppButton>
        </>
      }
    >
      <FlightForm
        key={flight?.id ?? 'create'}
        formId={FORM_ID}
        initialFlight={mode === 'edit' ? flight : null}
        onSubmit={onSubmit}
      />
    </AppDialog>
  );
}
