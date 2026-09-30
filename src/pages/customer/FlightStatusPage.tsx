import { PageContainer } from '@/components/common';
import { FlightStatusView } from '@/features/flights';

export function FlightStatusPage() {
  return (
    <PageContainer
      title="Flight status"
      description="Look up a flight by number and date for departure, arrival, terminal, gate, and status."
    >
      <FlightStatusView />
    </PageContainer>
  );
}
