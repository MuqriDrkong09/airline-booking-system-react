import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { AppAlert, ErrorState, SeatMapSkeleton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  useAdminAircraftDetailQuery,
  useUpdateAdminAircraftMutation,
} from '../hooks/useAdminAircraft';
import type { AircraftSeatMapConfig } from '../types/adminAircraft';
import { formatAircraftLabel } from '../utils/formatAdminAircraft';
import { AircraftSeatMapEditor } from './seatMap/AircraftSeatMapEditor';

export interface AdminAircraftSeatConfigViewProps {
  aircraftId: string;
}

export function AdminAircraftSeatConfigView({ aircraftId }: AdminAircraftSeatConfigViewProps) {
  const navigate = useNavigate();
  const detailQuery = useAdminAircraftDetailQuery(aircraftId);
  const updateMutation = useUpdateAdminAircraftMutation();

  if (detailQuery.isPending && !detailQuery.data) {
    return <SeatMapSkeleton showInspector />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ErrorState
        title="Unable to load aircraft"
        message="This aircraft may have been removed, or the seat map could not be loaded."
        onRetry={() => {
          void detailQuery.refetch();
        }}
      />
    );
  }

  const aircraft = detailQuery.data;

  const handleSave = async (seatMapConfig: AircraftSeatMapConfig) => {
    await updateMutation.mutateAsync({
      aircraftId: aircraft.id,
      input: {
        ...aircraft,
        seatMapConfig,
      },
    });
    await detailQuery.refetch();
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h6">
          {aircraft.registration} · {formatAircraftLabel(aircraft)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure rows, columns, seat labels, cabin class, seat type, price, emergency exits,
          and disabled seats on an interactive map.
        </Typography>
      </Stack>

      {updateMutation.isError ? (
        <AppAlert severity="error" onClose={() => updateMutation.reset()}>
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : 'Unable to save the seat map. Please try again.'}
        </AppAlert>
      ) : null}

      {updateMutation.isSuccess ? (
        <AppAlert severity="success" onClose={() => updateMutation.reset()}>
          Seat map saved successfully.
        </AppAlert>
      ) : null}

      <AircraftSeatMapEditor
        aircraft={aircraft}
        saving={updateMutation.isPending}
        onSave={handleSave}
        onCancel={() => {
          void navigate(APP_ROUTES.admin.aircraft);
        }}
      />
    </Stack>
  );
}
