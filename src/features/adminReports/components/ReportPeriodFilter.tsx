import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { AppInput } from '@/components/common';
import { REPORT_PERIOD_OPTIONS } from '../constants/options';
import type { ReportFilters, ReportPeriodPreset } from '../types/adminReport';
import { formatReportPeriodLabel } from '../utils/reportDateRange';

export interface ReportPeriodFilterProps {
  value: ReportFilters;
  onChange: (value: ReportFilters) => void;
}

export function ReportPeriodFilter({ value, onChange }: ReportPeriodFilterProps) {
  return (
    <Stack
      component="section"
      aria-label="Report period filters"
      spacing={2}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Period
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={value.preset}
          onChange={(_event, preset: ReportPeriodPreset | null) => {
            if (!preset) {
              return;
            }
            onChange({
              ...value,
              preset,
            });
          }}
          sx={{
            flexWrap: 'wrap',
            gap: 0.5,
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5,
            },
          }}
        >
          {REPORT_PERIOD_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {value.preset === 'custom' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            maxWidth: 560,
          }}
        >
          <AppInput
            label="From date"
            type="date"
            value={value.startDate}
            onChange={(event) => onChange({ ...value, startDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <AppInput
            label="To date"
            type="date"
            value={value.endDate}
            onChange={(event) => onChange({ ...value, endDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Showing {formatReportPeriodLabel(value.preset).toLowerCase()}.
        </Typography>
      )}
    </Stack>
  );
}
