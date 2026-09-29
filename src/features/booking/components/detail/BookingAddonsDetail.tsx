import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ADDON_CATALOG, formatAddonPrice, getAddonById } from '@/features/addons';
import type { Booking } from '../../types/bookingRecord';
import { passengerNameById } from '../../utils/bookingDetailHelpers';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingAddonsDetailProps {
  booking: Booking;
}

export function BookingAddonsDetail({ booking }: BookingAddonsDetailProps) {
  const names = passengerNameById(booking);

  return (
    <BookingDetailSection
      title="Add-ons"
      subtitle="Optional extras on this booking"
      empty={booking.addons.length === 0}
      emptyMessage="No add-ons selected."
    >
      <Stack spacing={1.25}>
        {booking.addons.map((selection) => {
          const addon = getAddonById(selection.addonId, ADDON_CATALOG);
          if (!addon) {
            return null;
          }

          return (
            <Stack
              key={`${selection.passengerId}-${selection.addonId}`}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1 }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {addon.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {names.get(selection.passengerId) ?? selection.passengerId}
                </Typography>
              </Stack>
              <Typography variant="body2">{formatAddonPrice(addon.price)}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </BookingDetailSection>
  );
}
