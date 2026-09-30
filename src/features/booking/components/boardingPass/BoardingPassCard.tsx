import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BookingETicketQr } from '../eticket/BookingETicketQr';
import type { BoardingPass } from '../../types/boardingPass';
import { BoardingPassBarcode } from './BoardingPassBarcode';

export interface BoardingPassCardProps {
  pass: BoardingPass;
}

function Meta({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.secondary',
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant={emphasize ? 'h5' : 'body1'}
        component="p"
        sx={{
          fontWeight: emphasize ? 800 : 700,
          letterSpacing: emphasize ? '-0.02em' : undefined,
          wordBreak: 'break-word',
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Mobile-first wallet-style boarding pass card (print-friendly).
 */
export function BoardingPassCard({ pass }: BoardingPassCardProps) {
  return (
    <Box
      component="article"
      aria-label={`Boarding pass ${pass.bookingReference} · ${pass.passengerName}`}
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
        alignSelf: 'center',
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        borderRadius: { xs: 2, sm: 2.5 },
        overflow: 'hidden',
        boxShadow: { xs: 1, sm: 2 },
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        '@media print': {
          boxShadow: 'none',
          borderRadius: 0,
          maxWidth: '100%',
        },
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 1.75,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '@media print': {
            bgcolor: 'transparent',
            color: 'text.primary',
            borderBottom: 2,
            borderColor: 'text.primary',
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.2 }}>
              AeroBook
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Boarding pass
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
              Ref
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {pass.bookingReference}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack spacing={2.25} sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Meta label="Passenger" value={pass.passengerName} emphasize />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h3"
              component="p"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {pass.originCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {pass.originCity}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0, fontWeight: 700, letterSpacing: '0.12em' }}
          >
            ✈
          </Typography>
          <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
            <Typography
              variant="h3"
              component="p"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {pass.destinationCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {pass.destinationCity}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 1.75,
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          }}
        >
          <Meta label="Flight" value={pass.flightNumber} />
          <Meta label="Date" value={pass.date} />
          <Meta label="Departure" value={pass.departureTime} />
          <Meta label="Boarding" value={pass.boardingTime} />
          <Meta label="Gate" value={pass.gate} />
          <Meta label="Terminal" value={pass.terminal} />
          <Meta label="Seat" value={pass.seat} emphasize />
          <Meta label="Group" value={pass.boardingGroup} emphasize />
        </Box>

        <Typography variant="caption" color="text.secondary">
          {pass.airline} · {pass.cabinClass}
        </Typography>

        <Divider
          sx={{
            borderStyle: 'dashed',
            '@media print': { borderStyle: 'solid' },
          }}
        />

        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <BookingETicketQr
            payload={pass.scanPayload}
            size={168}
            label="Boarding pass QR"
          />
          <BoardingPassBarcode payload={pass.scanPayload} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', maxWidth: 280 }}
          >
            Scan codes identify this booking only — no personal data encoded.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
