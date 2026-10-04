import { AppButton, AppDialog } from '@/components/common';
import type { AirportFormParsedValues } from '../schemas/airportFormSchema';
import type { AdminAirport } from '../types/adminAirport';
import { AirportForm } from './AirportForm';

export interface AirportDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  airport?: AdminAirport | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AirportFormParsedValues) => void | Promise<void>;
}

const FORM_ID = 'admin-airport-form';

export function AirportDialog({
  open,
  mode,
  airport = null,
  submitting = false,
  onClose,
  onSubmit,
}: AirportDialogProps) {
  const title = mode === 'create' ? 'Create airport' : `Edit ${airport?.code ?? 'airport'}`;

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
            {mode === 'create' ? 'Create airport' : 'Save changes'}
          </AppButton>
        </>
      }
    >
      <AirportForm
        key={airport?.id ?? 'create'}
        formId={FORM_ID}
        initialAirport={mode === 'edit' ? airport : null}
        onSubmit={onSubmit}
      />
    </AppDialog>
  );
}
