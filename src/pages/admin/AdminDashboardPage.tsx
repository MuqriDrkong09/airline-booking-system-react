import { PageContainer } from '@/components/common';
import { AdminDashboardView } from '@/features/adminDashboard';

export function AdminDashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="Overview of bookings, revenue, users, and flight operations."
    >
      <AdminDashboardView />
    </PageContainer>
  );
}
