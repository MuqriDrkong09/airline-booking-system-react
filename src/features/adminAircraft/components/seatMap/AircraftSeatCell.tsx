import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import { ADMIN_SEAT_TYPE_COLORS, ADMIN_SEAT_TYPE_LABELS } from '../../constants/seatTypes';
import type { AircraftConfiguredSeat } from '../../types/adminAircraft';

export interface AircraftSeatCellProps {
  seat: AircraftConfiguredSeat;
  selected?: boolean;
  onSelect: (seatId: string) => void;
}

export function AircraftSeatCell({ seat, selected = false, onSelect }: AircraftSeatCellProps) {
  const colors = ADMIN_SEAT_TYPE_COLORS[seat.seatType];
  const title = [
    seat.label,
    ADMIN_SEAT_TYPE_LABELS[seat.seatType],
    seat.cabinClass,
    `$${seat.price.toFixed(0)}`,
    seat.emergencyExit ? 'Emergency exit' : null,
    seat.disabled ? 'Disabled' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const ariaLabel = [
    `Configure seat ${seat.label}`,
    ADMIN_SEAT_TYPE_LABELS[seat.seatType],
    seat.cabinClass,
    seat.emergencyExit ? 'Emergency exit' : null,
    seat.disabled ? 'Disabled' : null,
    selected ? 'Selected' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(seat.id);
    }
  };

  return (
    <Tooltip title={title} enterDelay={300}>
      <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
        <Box
          component="button"
          type="button"
          data-seat-id={seat.id}
          aria-label={ariaLabel}
          aria-pressed={selected}
          onClick={() => onSelect(seat.id)}
          onKeyDown={handleKeyDown}
          sx={{
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
            p: 0,
            m: 0,
            borderRadius: 1,
            border: '2px solid',
            borderColor: selected ? 'primary.main' : colors.border,
            bgcolor: colors.bg,
            color: colors.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: seat.disabled ? 0.55 : 1,
            outline: selected ? '2px solid' : 'none',
            outlineColor: 'primary.main',
            outlineOffset: 2,
            userSelect: 'none',
            flexShrink: 0,
            font: 'inherit',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 1,
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
              boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.light}`,
            },
          }}
        >
          <Typography
            component="span"
            variant="caption"
            aria-hidden
            sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          >
            {seat.column}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}
