import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AppInput } from '@/components/common/AppInput';
import { useSearchAirportsQuery } from '../hooks/useAirports';
import type { Airport } from '../types';
import {
  formatAirportInputValue,
  formatAirportOptionLabel,
  formatAirportOptionSecondary,
} from '../utils/airportLabels';

export interface AirportAutocompleteProps {
  id: string;
  label: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  activeOnly?: boolean;
  excludeAirportCode?: string;
}

export function AirportAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = 'Search by code, city, or airport name',
  helperText,
  errorMessage,
  required = false,
  disabled = false,
  activeOnly = true,
  excludeAirportCode,
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(() => formatAirportInputValue(value));
  const deferredInput = useDeferredValue(inputValue.trim());
  const helperId = `${id}-helper`;
  const hasError = Boolean(errorMessage);
  const describedBy = helperText || errorMessage ? helperId : undefined;

  useEffect(() => {
    setInputValue(formatAirportInputValue(value));
  }, [value]);

  const searchQuery = useSearchAirportsQuery(
    {
      query: deferredInput,
      activeOnly,
      limit: 25,
    },
    { enabled: !disabled },
  );

  const options = useMemo(() => {
    const airports = searchQuery.data ?? [];
    const excluded = excludeAirportCode?.trim().toUpperCase();

    return excluded
      ? airports.filter((airport) => airport.code.toUpperCase() !== excluded)
      : airports;
  }, [excludeAirportCode, searchQuery.data]);

  return (
    <FormControl fullWidth required={required} disabled={disabled} error={hasError}>
      <FormLabel htmlFor={id} sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </FormLabel>
      <Autocomplete
        id={id}
        value={value}
        inputValue={inputValue}
        options={options}
        loading={searchQuery.isFetching}
        disabled={disabled}
        filterOptions={(items) => items}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        getOptionLabel={(option) => formatAirportOptionLabel(option)}
        noOptionsText={
          deferredInput.length === 0 ? 'Start typing to search airports' : 'No airports found'
        }
        onChange={(_event, nextValue) => {
          onChange(nextValue);
        }}
        onInputChange={(_event, nextInput, reason) => {
          if (reason === 'reset') {
            return;
          }
          setInputValue(nextInput);
          if (reason === 'input' && value && nextInput !== formatAirportInputValue(value)) {
            onChange(null);
          }
        }}
        renderOption={(props, option) => {
          const { key: _key, ...optionProps } = props;
          return (
            <li key={option.id} {...optionProps}>
              <Stack spacing={0.25} sx={{ py: 0.5 }}>
                <Typography variant="body2">{formatAirportOptionLabel(option)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatAirportOptionSecondary(option)}
                </Typography>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <AppInput
            {...params}
            placeholder={placeholder}
            error={hasError}
            required={required}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {searchQuery.isFetching ? (
                      <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                    ) : null}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      {errorMessage || helperText ? (
        <FormHelperText id={helperId}>{errorMessage ?? helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
