import { PageContainer } from '@/components/common';
import { AdminAirportsView } from '@/features/adminAirports';

export function AdminAirportsPage() {
  return (
    <PageContainer
      title="Airports"
      description="Search, filter, and manage airport master data including status and terminals."
    >
      <AdminAirportsView />
    </PageContainer>
  );
}
