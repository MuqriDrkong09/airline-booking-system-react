import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useMemo } from 'react';
import { AppAlert, AppButton, AppCard, SeatMapSkeleton } from '@/components/common';
import { useBookingStore } from '@/features/booking';
import type { SeatStatus } from '../constants/seat';
import { useSeatSelectionStore } from '../store/seatSelectionStore';
import { getSeatById } from '../utils/seatRules';
import { groupSeatsIntoRows } from '../utils/seatMap';
import { SeatLegend } from './SeatLegend';
import { SeatMap } from './SeatMap';
import { SeatSelectionSummary } from './SeatSelectionSummary';

export interface SeatSelectionPanelProps {
  onSaved?: () => void;
}

export function SeatSelectionPanel({ onSaved }: SeatSelectionPanelProps) {
  const context = useSeatSelectionStore((state) => state.context);
  const seats = useSeatSelectionStore((state) => state.seats);
  const passengers = useSeatSelectionStore((state) => state.passengers);
  const assignments = useSeatSelectionStore((state) => state.assignments);
  const selectedPassengerId = useSeatSelectionStore((state) => state.selectedPassengerId);
  const saveStatus = useSeatSelectionStore((state) => state.saveStatus);
  const saveError = useSeatSelectionStore((state) => state.saveError);
  const lastError = useSeatSelectionStore((state) => state.lastError);
  const selectPassenger = useSeatSelectionStore((state) => state.selectPassenger);
  const selectSeat = useSeatSelectionStore((state) => state.selectSeat);
  const clearSeatForPassenger = useSeatSelectionStore((state) => state.clearSeatForPassenger);
  const saveSelection = useSeatSelectionStore((state) => state.saveSelection);
  const clearSaveStatus = useSeatSelectionStore((state) => state.clearSaveStatus);
  const setBookingSeats = useBookingStore((state) => state.setSeats);

  const rows = useMemo(() => groupSeatsIntoRows(seats), [seats]);

  const passengerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const passenger of passengers) {
      map.set(passenger.id, passenger.displayName);
    }
    return map;
  }, [passengers]);

  const assignmentBySeatId = useMemo(() => {
    const map = new Map<string, string>();
    for (const assignment of assignments) {
      map.set(assignment.seatId, assignment.passengerId);
    }
    return map;
  }, [assignments]);

  const displayStatusBySeatId = useMemo(() => {
    const map = new Map<string, SeatStatus>();
    for (const seat of seats) {
      map.set(seat.id, assignmentBySeatId.has(seat.id) ? 'SELECTED' : seat.status);
    }
    return map;
  }, [seats, assignmentBySeatId]);

  const selectedLabelBySeatId = useMemo(() => {
    const map = new Map<string, string>();
    for (const [seatId, passengerId] of assignmentBySeatId) {
      const name = passengerNameById.get(passengerId);
      if (name) {
        map.set(seatId, name);
      }
    }
    return map;
  }, [assignmentBySeatId, passengerNameById]);

  if (!context || seats.length === 0) {
    return <SeatMapSkeleton showInspector />;
  }

  return (
    <Stack spacing={2.5}>
      {saveStatus === 'saved' ? (
        <AppAlert severity="success" title="Seats saved" onClose={clearSaveStatus}>
          Seat assignments were saved for this booking.
        </AppAlert>
      ) : null}

      {saveError || lastError ? (
        <AppAlert severity="error" title="Seat selection" onClose={clearSaveStatus}>
          {saveError || lastError}
        </AppAlert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(280px, 340px)' },
          alignItems: 'start',
        }}
      >
        <AppCard title="Seat map" subtitle="Scroll horizontally on smaller screens.">
          <Stack spacing={2}>
            <SeatLegend />
            <SeatMap
              aircraftModel={context.aircraftModel}
              rows={rows}
              displayStatusBySeatId={displayStatusBySeatId}
              selectedLabelBySeatId={selectedLabelBySeatId}
              onSelect={selectSeat}
            />
          </Stack>
        </AppCard>

        <Stack spacing={2}>
          <SeatSelectionSummary
            passengers={passengers}
            seats={seats}
            assignments={assignments}
            selectedPassengerId={selectedPassengerId}
            onSelectPassenger={selectPassenger}
            onClearSeat={clearSeatForPassenger}
          />

          <AppButton
            variant="contained"
            fullWidth
            onClick={() => {
              const result = saveSelection();
              if (result.ok) {
                const { seats: currentSeats, assignments: currentAssignments } =
                  useSeatSelectionStore.getState();
                setBookingSeats(
                  currentAssignments
                    .map((assignment) => {
                      const seat = getSeatById(currentSeats, assignment.seatId);
                      if (!seat) {
                        return null;
                      }
                      return {
                        passengerId: assignment.passengerId,
                        seatId: seat.id,
                        label: seat.label,
                        price: seat.price,
                      };
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== null),
                );
                onSaved?.();
              }
            }}
          >
            Save seat selection
          </AppButton>
        </Stack>
      </Box>
    </Stack>
  );
}
