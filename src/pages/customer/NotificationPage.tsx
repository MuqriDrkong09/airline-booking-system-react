import { PageContainer } from '@/components/common';
import { NotificationsView } from '@/features/notifications';

export function NotificationPage() {
  return (
    <PageContainer
      title="Notifications"
      description="Stay up to date on bookings, payments, check-in, boarding, and flight changes."
    >
      <NotificationsView />
    </PageContainer>
  );
}
