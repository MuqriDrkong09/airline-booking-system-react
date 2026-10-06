import { PageContainer } from '@/components/common';
import { AdminReportsView } from '@/features/adminReports';

export function AdminReportsPage() {
  return (
    <PageContainer
      title="Reports"
      description="Analyze revenue, bookings, passengers, cancellations, refunds, and route performance across selectable date ranges."
    >
      <AdminReportsView />
    </PageContainer>
  );
}
