import { AppButton, AppDialog } from '@/components/common';
import type { PromoCodeFormParsedValues } from '../schemas/promoCodeFormSchema';
import type { AdminPromoCode } from '../types/adminPromoCode';
import { PromoCodeForm } from './PromoCodeForm';

export interface PromoCodeDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  promoCode?: AdminPromoCode | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: PromoCodeFormParsedValues) => void | Promise<void>;
}

const FORM_ID = 'admin-promo-code-form';

export function PromoCodeDialog({
  open,
  mode,
  promoCode = null,
  submitting = false,
  onClose,
  onSubmit,
}: PromoCodeDialogProps) {
  const title =
    mode === 'create' ? 'Create promo code' : `Edit ${promoCode?.code ?? 'promo code'}`;

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
            {mode === 'create' ? 'Create promo code' : 'Save changes'}
          </AppButton>
        </>
      }
    >
      <PromoCodeForm
        key={promoCode?.id ?? 'create'}
        formId={FORM_ID}
        initialPromoCode={mode === 'edit' ? promoCode : null}
        onSubmit={onSubmit}
      />
    </AppDialog>
  );
}
