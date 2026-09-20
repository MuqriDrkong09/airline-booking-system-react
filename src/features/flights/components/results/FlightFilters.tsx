import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppButton, AppCard } from '@/components/common';
import type { FlightFilterState } from '../../types/flight';
import { DEFAULT_FLIGHT_FILTERS, formatPrice } from '../../utils/flightResults';

export interface FlightFiltersProps {
  value: FlightFilterState;
  airlineOptions: Array<{ code: string; name: string }>;
  maxPriceCeiling: number;
  currency?: string;
  onChange: (next: FlightFilterState) => void;
}

const STOP_OPTIONS: Array<{ value: 0 | 1 | 2; label: string }> = [
  { value: 0, label: 'Nonstop' },
  { value: 1, label: '1 stop' },
  { value: 2, label: '2+ stops' },
];

export function FlightFilters({
  value,
  airlineOptions,
  maxPriceCeiling,
  currency = 'MYR',
  onChange,
}: FlightFiltersProps) {
  const toggleStop = (stop: 0 | 1 | 2) => {
    const exists = value.stops.includes(stop);
    onChange({
      ...value,
      stops: exists ? value.stops.filter((item) => item !== stop) : [...value.stops, stop],
    });
  };

  const toggleAirline = (code: string) => {
    const exists = value.airlines.includes(code);
    onChange({
      ...value,
      airlines: exists
        ? value.airlines.filter((item) => item !== code)
        : [...value.airlines, code],
    });
  };

  return (
    <AppCard title="Filters">
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Stops
          </Typography>
          <FormGroup>
            {STOP_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    size="small"
                    checked={value.stops.includes(option.value)}
                    onChange={() => toggleStop(option.value)}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Airlines
          </Typography>
          <FormGroup>
            {airlineOptions.map((airline) => (
              <FormControlLabel
                key={airline.code}
                control={
                  <Checkbox
                    size="small"
                    checked={value.airlines.includes(airline.code)}
                    onChange={() => toggleAirline(airline.code)}
                  />
                }
                label={`${airline.name} (${airline.code})`}
              />
            ))}
          </FormGroup>
        </Stack>

        {maxPriceCeiling > 0 ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Max price
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Up to {formatPrice(value.maxPrice ?? maxPriceCeiling, currency)}
            </Typography>
            <Slider
              min={Math.min(100, maxPriceCeiling)}
              max={maxPriceCeiling}
              step={10}
              value={value.maxPrice ?? maxPriceCeiling}
              onChange={(_event, nextValue) => {
                onChange({
                  ...value,
                  maxPrice: Array.isArray(nextValue) ? nextValue[0]! : nextValue,
                });
              }}
              valueLabelDisplay="auto"
              aria-label="Maximum price"
            />
          </Stack>
        ) : null}

        <AppButton
          variant="text"
          onClick={() => onChange({ ...DEFAULT_FLIGHT_FILTERS })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Clear filters
        </AppButton>
      </Stack>
    </AppCard>
  );
}
