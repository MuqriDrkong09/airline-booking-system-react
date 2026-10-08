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

function focusAdjacentSeat(current: HTMLElement, key: string) {
  const map = current.closest('[data-seat-map]');
  if (!map) {
    return;
  }
  const seats = Array.from(
    map.querySelectorAll<HTMLButtonElement>('button[data-seat-id]:not(:disabled)'),
  );
  const index = seats.indexOf(current as HTMLButtonElement);
  if (index < 0) {
    return;
  }

  const currentRow = Number(current.dataset.seatRow);
  const currentCol = current.dataset.seatCol ?? '';

  let next: HTMLButtonElement | undefined;

  if (key === 'ArrowRight') {
    next = seats[index + 1];
  } else if (key === 'ArrowLeft') {
    next = seats[index - 1];
  } else if (key === 'ArrowDown' || key === 'ArrowUp') {
    const rowNumbers = [
      ...new Set(seats.map((seat) => Number(seat.dataset.seatRow))),
    ].sort((a, b) => a - b);
    const rowIndex = rowNumbers.indexOf(currentRow);
    const targetRow =
      key === 'ArrowDown' ? rowNumbers[rowIndex + 1] : rowNumbers[rowIndex - 1];
    if (targetRow !== undefined) {
      const sameRow = seats.filter((seat) => Number(seat.dataset.seatRow) === targetRow);
      next = sameRow.find((seat) => seat.dataset.seatCol === currentCol) ?? sameRow[0];
    }
  }

  next?.focus();
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

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusAdjacentSeat(event.currentTarget, event.key);
      return;
    }
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(seat.id);
    }
  };

  const button = (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      data-seat-id={seat.id}
      data-seat-row={seat.row}
      data-seat-col={seat.column}
      aria-label={ariaLabel}
      aria-pressed={displayStatus === 'SELECTED'}
      onClick={() => {
        if (!disabled) {
          onSelect(seat.id);
        }
      }}
      onKeyDown={handleKeyDown}
      sx={{
        width: { xs: 34, sm: 40 },
        height: { xs: 34, sm: 40 },
        p: 0,
        m: 0,
        borderRadius: 1,
        border: '2px solid',
        borderColor: colors.border,
        bgcolor: colors.bg,
        color: colors.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: displayStatus === 'UNAVAILABLE' ? 0.7 : 1,
        userSelect: 'none',
        flexShrink: 0,
        font: 'inherit',
        outline: 'none',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': disabled
          ? undefined
          : {
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
  );

  return (
    <Tooltip
      title={`${seat.label} · ${SEAT_STATUS_LABELS[displayStatus]} · ${formatSeatPrice(seat.price)}`}
      enterDelay={400}
    >
      {/* Span wrapper so tooltips still work for disabled seats. */}
      <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
        {button}
      </Box>
    </Tooltip>
  );
}
