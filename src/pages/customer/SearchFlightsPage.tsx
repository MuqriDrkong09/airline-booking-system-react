import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { AppAlert, AppButton, AppCard, AppInput, PageContainer } from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import { AirportAutocomplete, formatAirportOptionLabel, type Airport } from '@/features/flights';

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function SearchFlightsPage() {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState(tomorrowIsoDate);
  const [originError, setOriginError] = useState<string | undefined>();
  const [destinationError, setDestinationError] = useState<string | undefined>();
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginError(undefined);
    setDestinationError(undefined);
    setSearchSummary(null);
  };

  const handleSearch = () => {
    let hasError = false;

    if (!origin) {
      setOriginError('Select a departure airport');
      hasError = true;
    } else {
      setOriginError(undefined);
    }

    if (!destination) {
      setDestinationError('Select an arrival airport');
      hasError = true;
    } else {
      setDestinationError(undefined);
    }

    if (origin && destination && origin.code === destination.code) {
      setDestinationError('Arrival airport must be different from departure');
      hasError = true;
    }

    if (hasError || !origin || !destination) {
      setSearchSummary(null);
      return;
    }

    setSearchSummary(
      `Searching ${formatAirportOptionLabel(origin)} → ${formatAirportOptionLabel(destination)} on ${departureDate}. Flight results will be added in a later update.`,
    );
  };

  return (
    <PageContainer
      title="Search flights"
      description="Choose origin and destination airports to start planning your trip."
    >
      <Stack spacing={3} sx={{ maxWidth: 880 }}>
        <AppCard title="Where are you flying?">
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { md: 'flex-end' } }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <AirportAutocomplete
                  id="flight-origin"
                  label="From"
                  value={origin}
                  onChange={(airport) => {
                    setOrigin(airport);
                    setOriginError(undefined);
                    setSearchSummary(null);
                  }}
                  required
                  errorMessage={originError}
                  excludeAirportCode={destination?.code}
                  helperText="Search by code, city, airport name, or country"
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'flex-end', md: 'center' },
                  pb: { md: 0.5 },
                }}
              >
                <IconButton
                  aria-label="Swap origin and destination"
                  onClick={swapAirports}
                  disabled={!origin && !destination}
                  color="primary"
                >
                  <ArrowLeftRight aria-hidden="true" size={20} />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <AirportAutocomplete
                  id="flight-destination"
                  label="To"
                  value={destination}
                  onChange={(airport) => {
                    setDestination(airport);
                    setDestinationError(undefined);
                    setSearchSummary(null);
                  }}
                  required
                  errorMessage={destinationError}
                  excludeAirportCode={origin?.code}
                  helperText="Search by code, city, airport name, or country"
                />
              </Box>
            </Stack>

            <Box sx={{ maxWidth: { sm: 280 } }}>
              <FormField id="flight-departure-date" label="Departure date" required>
                <AppInput
                  type="date"
                  value={departureDate}
                  onChange={(event) => {
                    setDepartureDate(event.target.value);
                    setSearchSummary(null);
                  }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: tomorrowIsoDate() },
                  }}
                />
              </FormField>
            </Box>

            <AppButton variant="contained" size="large" onClick={handleSearch} sx={{ alignSelf: 'flex-start' }}>
              Search flights
            </AppButton>
          </Stack>
        </AppCard>

        {searchSummary ? (
          <AppAlert severity="info" title="Search ready">
            {searchSummary}
          </AppAlert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Try searching for airports like <strong>KUL</strong>, <strong>Singapore</strong>, or{' '}
            <strong>Tokyo</strong>.
          </Typography>
        )}
      </Stack>
    </PageContainer>
  );
}
