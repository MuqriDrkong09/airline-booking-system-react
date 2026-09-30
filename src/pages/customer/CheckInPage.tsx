import { PageContainer } from '@/components/common';
import { CheckInView } from '@/features/booking';

export function CheckInPage() {
  return (
    <PageContainer
      title="Online check-in"
      description="Enter your booking reference and last name, confirm seats and baggage, then check in."
    >
      <CheckInView />
    </PageContainer>
  );
}
