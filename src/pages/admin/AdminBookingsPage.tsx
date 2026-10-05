import { PageContainer } from '@/components/common';
import { AdminBookingsView } from '@/features/adminBookings';

export function AdminBookingsPage() {
  return (
    <PageContainer
      title="Bookings"
      description="Search, filter, and manage customer bookings with cancel, refund, and contact modifications."
    >
      <AdminBookingsView />
    </PageContainer>
  );
}
