import { PageContainer } from '@/components/common';
import { AdminFlightsView } from '@/features/adminFlights';

export function AdminFlightsPage() {
  return (
    <PageContainer
      title="Flights"
      description="Search, filter, and manage airline schedules, seats, and operational status."
    >
      <AdminFlightsView />
    </PageContainer>
  );
}
