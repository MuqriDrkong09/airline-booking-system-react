import { AppButton, AppDialog } from '@/components/common';
import type { AircraftFormParsedValues } from '../schemas/aircraftFormSchema';
import type { AdminAircraft } from '../types/adminAircraft';
import { AircraftForm } from './AircraftForm';

export interface AircraftDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  aircraft?: AdminAircraft | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AircraftFormParsedValues) => void | Promise<void>;
}

const FORM_ID = 'admin-aircraft-form';

export function AircraftDialog({
  open,
  mode,
  aircraft = null,
  submitting = false,
  onClose,
  onSubmit,
}: AircraftDialogProps) {
  const title =
    mode === 'create' ? 'Create aircraft' : `Edit ${aircraft?.registration ?? 'aircraft'}`;

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
            {mode === 'create' ? 'Create aircraft' : 'Save changes'}
          </AppButton>
        </>
      }
    >
      <AircraftForm
        key={aircraft?.id ?? 'create'}
        formId={FORM_ID}
        initialAircraft={mode === 'edit' ? aircraft : null}
        onSubmit={onSubmit}
      />
    </AppDialog>
  );
}
