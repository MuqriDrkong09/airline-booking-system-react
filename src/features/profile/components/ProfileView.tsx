import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NATIONALITIES, USER_TITLES } from '@/constants/registration';
import {
  CABIN_PREFERENCES,
  DEFAULT_TRAVEL_PREFERENCES,
  MEAL_PREFERENCES,
  SEAT_PREFERENCES,
} from '@/types/profile';
import type { AuthUser } from '@/types/auth';
import { getDisplayName, getRoleLabel } from '@/features/auth';

function findLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
  fallback = '—',
): string {
  if (!value) {
    return fallback;
  }

  return options.find((option) => option.value === value)?.label ?? value;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

interface ProfileFieldProps {
  label: string;
  value: string;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}

export interface ProfileViewProps {
  user: AuthUser;
}

export function ProfileView({ user }: ProfileViewProps) {
  const preferences = user.travelPreferences ?? DEFAULT_TRAVEL_PREFERENCES;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: { md: '1 1 0' }, minWidth: 0 } }}
      >
        <ProfileField label="Full name" value={getDisplayName(user)} />
        <ProfileField label="Role" value={getRoleLabel(user.role)} />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: { md: '1 1 0' }, minWidth: 0 } }}
      >
        <ProfileField label="Title" value={findLabel(USER_TITLES, user.title)} />
        <ProfileField label="Email" value={user.email} />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: { md: '1 1 0' }, minWidth: 0 } }}
      >
        <ProfileField label="Phone" value={user.phone ?? '—'} />
        <ProfileField label="Date of birth" value={formatDate(user.dateOfBirth)} />
      </Stack>

      <ProfileField
        label="Nationality"
        value={findLabel(NATIONALITIES, user.nationality)}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: { md: '1 1 0' }, minWidth: 0 } }}
      >
        <ProfileField
          label="Preferred cabin"
          value={findLabel(CABIN_PREFERENCES, preferences.preferredCabin)}
        />
        <ProfileField
          label="Seat preference"
          value={findLabel(SEAT_PREFERENCES, preferences.seatPreference)}
        />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ '& > *': { flex: { md: '1 1 0' }, minWidth: 0 } }}
      >
        <ProfileField
          label="Meal preference"
          value={findLabel(MEAL_PREFERENCES, preferences.mealPreference)}
        />
        <ProfileField
          label="Travel offers"
          value={preferences.newsletterOptIn ? 'Subscribed' : 'Not subscribed'}
        />
      </Stack>
    </Stack>
  );
}
