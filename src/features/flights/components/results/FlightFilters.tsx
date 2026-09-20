import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AppButton, AppCard } from '@/components/common';
import { CABIN_CLASS_OPTIONS } from '../../constants/search';
import type { CabinClass } from '../../types';
import type { FlightFilterBounds, FlightFilterState } from '../../types/flight';
import {
  formatDuration,
  formatHourLabel,
  formatPrice,
} from '../../utils/flightResults';

export interface FlightFiltersProps {
  value: FlightFilterState;
  airlineOptions: Array<{ code: string; name: string }>;
  cabinOptions: CabinClass[];
  bounds: FlightFilterBounds;
  currency?: string;
  activeFilterCount?: number;
  onChange: (next: FlightFilterState) => void;
  onClear: () => void;
  /** When false, renders panel content without the card chrome (drawer body). */
  embedded?: boolean;
}

const STOP_OPTIONS: Array<{ value: 0 | 1 | 2; label: string }> = [
  { value: 0, label: 'Nonstop' },
  { value: 1, label: '1 stop' },
  { value: 2, label: '2+ stops' },
];

function toggleListValue<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function FlightFiltersComponent({
  value,
  airlineOptions,
  cabinOptions,
  bounds,
  currency = 'MYR',
  activeFilterCount = 0,
  onChange,
  onClear,
  embedded = false,
}: FlightFiltersProps) {
  const priceRange: [number, number] = [
    value.priceMin ?? bounds.priceMin,
    value.priceMax ?? bounds.priceMax,
  ];
  const departureRange: [number, number] = [
    value.departureHourStart ?? 0,
    value.departureHourEnd ?? 24,
  ];
  const arrivalRange: [number, number] = [
    value.arrivalHourStart ?? 0,
    value.arrivalHourEnd ?? 24,
  ];
  const durationValue = value.durationMax ?? bounds.durationMax;

  // Local slider drafts avoid URL churn / list recomputation while dragging.
  const [draftPrice, setDraftPrice] = useState<[number, number]>(priceRange);
  const [draftDeparture, setDraftDeparture] = useState<[number, number]>(departureRange);
  const [draftArrival, setDraftArrival] = useState<[number, number]>(arrivalRange);
  const [draftDuration, setDraftDuration] = useState(durationValue);

  useEffect(() => {
    setDraftPrice(priceRange);
  }, [priceRange[0], priceRange[1]]);

  useEffect(() => {
    setDraftDeparture(departureRange);
  }, [departureRange[0], departureRange[1]]);

  useEffect(() => {
    setDraftArrival(arrivalRange);
  }, [arrivalRange[0], arrivalRange[1]]);

  useEffect(() => {
    setDraftDuration(durationValue);
  }, [durationValue]);

  const availableCabins = useMemo(() => {
    const available = new Set(cabinOptions);
    return CABIN_CLASS_OPTIONS.filter((option) => available.has(option.value));
  }, [cabinOptions]);

  const patch = useCallback(
    (partial: Partial<FlightFilterState>) => {
      onChange({ ...value, ...partial });
    },
    [onChange, value],
  );

  const content = (
    <Stack spacing={2.5} component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Typography component="legend" variant="subtitle1" sx={{ fontWeight: 700, px: 0 }}>
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
      </Typography>

      <Stack spacing={1}>
        <Typography id="filter-price-label" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Price range
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPrice(draftPrice[0], currency)} – {formatPrice(draftPrice[1], currency)}
        </Typography>
        <Slider
          value={draftPrice}
          min={bounds.priceMin}
          max={Math.max(bounds.priceMin, bounds.priceMax)}
          step={10}
          disableSwap
          valueLabelDisplay="auto"
          aria-labelledby="filter-price-label"
          getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
          onChange={(_event, next) => {
            setDraftPrice(next as [number, number]);
          }}
          onChangeCommitted={(_event, next) => {
            const [min, max] = next as [number, number];
            patch({
              priceMin: min <= bounds.priceMin ? null : min,
              priceMax: max >= bounds.priceMax ? null : max,
            });
          }}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Stops
        </Typography>
        <FormGroup aria-label="Stops">
          {STOP_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  size="small"
                  checked={value.stops.includes(option.value)}
                  onChange={() => patch({ stops: toggleListValue(value.stops, option.value) })}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Airlines
        </Typography>
        <FormGroup aria-label="Airlines">
          {airlineOptions.map((airline) => (
            <FormControlLabel
              key={airline.code}
              control={
                <Checkbox
                  size="small"
                  checked={value.airlines.includes(airline.code)}
                  onChange={() =>
                    patch({ airlines: toggleListValue(value.airlines, airline.code) })
                  }
                />
              }
              label={`${airline.name} (${airline.code})`}
            />
          ))}
        </FormGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography id="filter-departure-label" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Departure time
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatHourLabel(draftDeparture[0])} – {formatHourLabel(draftDeparture[1])}
        </Typography>
        <Slider
          value={draftDeparture}
          min={0}
          max={24}
          step={1}
          disableSwap
          valueLabelDisplay="auto"
          valueLabelFormat={formatHourLabel}
          aria-labelledby="filter-departure-label"
          getAriaLabel={(index) =>
            index === 0 ? 'Earliest departure hour' : 'Latest departure hour'
          }
          onChange={(_event, next) => setDraftDeparture(next as [number, number])}
          onChangeCommitted={(_event, next) => {
            const [start, end] = next as [number, number];
            patch({
              departureHourStart: start <= 0 ? null : start,
              departureHourEnd: end >= 24 ? null : end,
            });
          }}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography id="filter-arrival-label" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Arrival time
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatHourLabel(draftArrival[0])} – {formatHourLabel(draftArrival[1])}
        </Typography>
        <Slider
          value={draftArrival}
          min={0}
          max={24}
          step={1}
          disableSwap
          valueLabelDisplay="auto"
          valueLabelFormat={formatHourLabel}
          aria-labelledby="filter-arrival-label"
          getAriaLabel={(index) =>
            index === 0 ? 'Earliest arrival hour' : 'Latest arrival hour'
          }
          onChange={(_event, next) => setDraftArrival(next as [number, number])}
          onChangeCommitted={(_event, next) => {
            const [start, end] = next as [number, number];
            patch({
              arrivalHourStart: start <= 0 ? null : start,
              arrivalHourEnd: end >= 24 ? null : end,
            });
          }}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography id="filter-duration-label" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Max duration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Up to {formatDuration(draftDuration)}
        </Typography>
        <Slider
          value={draftDuration}
          min={Math.min(60, bounds.durationMax || 60)}
          max={Math.max(60, bounds.durationMax)}
          step={15}
          valueLabelDisplay="auto"
          valueLabelFormat={(minutes) => formatDuration(minutes)}
          aria-labelledby="filter-duration-label"
          aria-label="Maximum duration"
          onChange={(_event, next) => setDraftDuration(next as number)}
          onChangeCommitted={(_event, next) => {
            const minutes = next as number;
            patch({
              durationMax: minutes >= bounds.durationMax ? null : minutes,
            });
          }}
        />
      </Stack>

      {availableCabins.length > 0 ? (
        <Stack spacing={1}>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
            Cabin class
          </Typography>
          <FormGroup aria-label="Cabin class">
            {availableCabins.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    size="small"
                    checked={value.cabinClasses.includes(option.value)}
                    onChange={() =>
                      patch({
                        cabinClasses: toggleListValue(value.cabinClasses, option.value),
                      })
                    }
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Stack>
      ) : null}

      <Stack spacing={0.5}>
        <FormControlLabel
          control={
            <Switch
              checked={value.refundableOnly}
              onChange={(_event, checked) => patch({ refundableOnly: checked })}
              slotProps={{ input: { 'aria-label': 'Refundable only' } }}
            />
          }
          label="Refundable only"
        />
        <FormControlLabel
          control={
            <Switch
              checked={value.baggageIncludedOnly}
              onChange={(_event, checked) => patch({ baggageIncludedOnly: checked })}
              slotProps={{ input: { 'aria-label': 'Baggage included only' } }}
            />
          }
          label="Baggage included"
        />
      </Stack>

      <AppButton
        variant="text"
        onClick={onClear}
        disabled={activeFilterCount === 0}
        sx={{ alignSelf: 'flex-start' }}
      >
        Clear filters
      </AppButton>
    </Stack>
  );

  if (embedded) {
    return content;
  }

  return <AppCard>{content}</AppCard>;
}

export const FlightFilters = memo(FlightFiltersComponent);
