import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import { ACTIVE_FILTER_OPTIONS, ROLE_FILTER_OPTIONS } from '../constants/options';
import {
  EMPTY_ADMIN_USER_FILTERS,
  type AdminUserFilters,
} from '../types/adminUser';

export interface UserFiltersProps {
  value: AdminUserFilters;
  onChange: (value: AdminUserFilters) => void;
}

export function UserFilters({ value, onChange }: UserFiltersProps) {
  const update = (patch: Partial<AdminUserFilters>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      component="section"
      aria-label="User filters"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '2fr repeat(2, minmax(0, 1fr)) auto',
        },
        alignItems: { xs: 'stretch', lg: 'end' },
      }}
    >
      <AppInput
        label="Search"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        placeholder="Name, email, phone…"
      />
      <AppSelect
        label="Role"
        options={ROLE_FILTER_OPTIONS}
        value={value.role}
        onChange={(role) => update({ role: role as AdminUserFilters['role'] })}
      />
      <AppSelect
        label="Status"
        options={ACTIVE_FILTER_OPTIONS}
        value={value.active}
        onChange={(active) => update({ active: active as AdminUserFilters['active'] })}
      />
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() => onChange({ ...EMPTY_ADMIN_USER_FILTERS })}
          fullWidth
          sx={{ width: { lg: 'auto' } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Box>
  );
}
