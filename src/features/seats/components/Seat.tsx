import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import {
  SEAT_CLASS_LABELS,
  SEAT_STATUS_COLORS,
  SEAT_STATUS_LABELS,
  type SeatStatus,
} from '../constants/seat';
import type { Seat as SeatModel } from '../types/seat';
import { formatSeatPrice } from '../utils/seatMap';

export interface SeatProps {
  seat: SeatModel;
  displayStatus: SeatStatus;
  selectedByLabel?: string;
  onSelect: (seatId: string) => void;
}

function isInteractiveStatus(status: SeatStatus): boolean {
  return (
    status === 'AVAILABLE' ||
    status === 'SELECTED' ||
    status === 'PREMIUM' ||
    status === 'EMERGENCY_EXIT'
  );
}

export function Seat({ seat, displayStatus, selectedByLabel, onSelect }: SeatProps) {
  const colors = SEAT_STATUS_COLORS[displayStatus];
  const disabled = !isInteractiveStatus(displayStatus);

  const ariaLabel = [
    `Seat ${seat.label}`,
    SEAT_CLASS_LABELS[seat.class],
    SEAT_STATUS_LABELS[displayStatus],
    formatSeatPrice(seat.price),
    selectedByLabel ? `assigned to ${selectedByLabel}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(seat.id);
    }
  };

  return (
    <Tooltip
      title={`${seat.label} · ${SEAT_STATUS_LABELS[displayStatus]} · ${formatSeatPrice(seat.price)}`}
      enterDelay={400}
    >
      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-pressed={displayStatus === 'SELECTED'}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) {
            onSelect(seat.id);
          }
        }}
        onKeyDown={handleKeyDown}
        sx={{
          width: { xs: 34, sm: 40 },
          height: { xs: 34, sm: 40 },
          borderRadius: 1,
          border: '2px solid',
          borderColor: colors.border,
          bgcolor: colors.bg,
          color: colors.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: displayStatus === 'UNAVAILABLE' ? 0.55 : 1,
          userSelect: 'none',
          flexShrink: 0,
          outline: 'none',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
          '&:hover': disabled
            ? undefined
            : {
                transform: 'translateY(-1px)',
                boxShadow: 1,
              },
          '&:focus-visible': {
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.light}`,
          },
        }}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        >
          {seat.column}
        </Typography>
      </Box>
    </Tooltip>
  );
}
