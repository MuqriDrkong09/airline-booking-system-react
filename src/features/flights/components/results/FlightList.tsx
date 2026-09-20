import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlightOffer } from '../../types/flight';
import { FlightCard } from './FlightCard';

export interface FlightListProps {
  flights: FlightOffer[];
  onSelectFlight?: (flight: FlightOffer) => void;
}

export function FlightList({ flights, onSelectFlight }: FlightListProps) {
  return (
    <Stack spacing={1.75} component="section" aria-label="Flight results">
      <Typography variant="body2" color="text.secondary">
        {flights.length} flight{flights.length === 1 ? '' : 's'} found
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
          width: '100%',
        }}
      >
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} onSelect={onSelectFlight} />
        ))}
      </Box>
    </Stack>
  );
}
