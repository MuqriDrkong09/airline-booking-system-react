import { useParams } from 'react-router-dom';
import { ErrorState, PageContainer } from '@/components/common';
import { AdminAircraftSeatConfigView } from '@/features/adminAircraft';

export function AdminAircraftSeatConfigPage() {
  const { aircraftId = '' } = useParams<{ aircraftId: string }>();

  if (!aircraftId) {
    return (
      <PageContainer title="Seat configuration" description="Configure aircraft seat maps.">
        <ErrorState
          title="Aircraft not specified"
          message="Open seat configuration from the aircraft list."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Seat configuration"
      description="Interactively configure cabin geometry and per-seat properties for this aircraft."
    >
      <AdminAircraftSeatConfigView aircraftId={aircraftId} />
    </PageContainer>
  );
}
