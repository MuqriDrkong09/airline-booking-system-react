import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { TRIP_TYPE_OPTIONS } from '../constants/search';
import type { TripType } from '../types';

export interface TripTypeSelectorProps {
  value: TripType;
  onChange: (tripType: TripType) => void;
  disabled?: boolean;
}

export function TripTypeSelector({ value, onChange, disabled = false }: TripTypeSelectorProps) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      color="primary"
      size="small"
      value={value}
      disabled={disabled}
      aria-label="Trip type"
      onChange={(_event, nextValue: TripType | null) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      sx={{
        p: 0.5,
        gap: 0.5,
        borderRadius: 2,
        bgcolor: 'action.hover',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: '10px !important',
          margin: 0,
        },
        '& .MuiToggleButton-root': {
          flex: { xs: '1 1 100%', sm: '1 1 0' },
          py: 1,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
          '&.Mui-selected': {
            bgcolor: 'background.paper',
            color: 'primary.main',
            boxShadow: (theme) => theme.shadows[1],
            '&:hover': {
              bgcolor: 'background.paper',
            },
          },
        },
      }}
    >
      {TRIP_TYPE_OPTIONS.map((option) => (
        <ToggleButton key={option.value} value={option.value} disableRipple>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
