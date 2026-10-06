import { PageContainer } from '@/components/common';
import { AdminPromoCodesView } from '@/features/adminPromoCodes';

export function AdminPromoCodesPage() {
  return (
    <PageContainer
      title="Promo Codes"
      description="Create and manage discount codes, validity windows, usage limits, and active status."
    >
      <AdminPromoCodesView />
    </PageContainer>
  );
}
