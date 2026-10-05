import { PageContainer } from '@/components/common';
import { AdminAircraftView } from '@/features/adminAircraft';

export function AdminAircraftPage() {
  return (
    <PageContainer
      title="Aircraft"
      description="Manage fleet aircraft, cabin seat counts, activation status, and seat-map configuration readiness."
    >
      <AdminAircraftView />
    </PageContainer>
  );
}
