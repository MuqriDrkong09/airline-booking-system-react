import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { AppAlert, AppButton } from '@/components/common';
import { AddonSelectionPanel } from '@/features/addons';
import { BaggageSelectionPanel } from '@/features/baggage';
import { MealSelectionPanel } from '@/features/meals';
import { SeatSelectionPanel } from '@/features/seats';
import type { ManageBookingSection } from '../../constants/manageBooking';
import type { Booking } from '../../types/bookingRecord';
import {
  clearManageSession,
  commitManageSession,
  seedManageSession,
  toPanelPassengers,
} from '../../utils/manageBookingSession';
import { ManageBookingOverview } from './ManageBookingOverview';
import { ManageContactForm } from './ManageContactForm';

export interface ManageBookingViewProps {
  booking: Booking;
  section: ManageBookingSection;
  onSectionChange: (section: ManageBookingSection) => void;
}

export function ManageBookingView({
  booking,
  section,
  onSectionChange,
}: ManageBookingViewProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (section === 'overview' || section === 'contact' || section === 'flight') {
      return;
    }
    seedManageSession(booking);
    return () => {
      // Keep draft until leave manage page; overview/contact don't need clear mid-session.
    };
  }, [booking, section]);

  useEffect(() => {
    return () => {
      clearManageSession();
    };
  }, []);

  const handleAncillarySaved = (label: string) => {
    const updated = commitManageSession(booking.reference);
    if (updated) {
      setFeedback(`${label} updated. New total reflects on this booking.`);
      onSectionChange('overview');
    } else {
      setFeedback(`Could not save ${label.toLowerCase()}.`);
    }
  };

  const passengers = toPanelPassengers(booking);

  return (
    <Stack spacing={2.5}>
      {feedback ? (
        <AppAlert severity="success" onClose={() => setFeedback(null)}>
          {feedback}
        </AppAlert>
      ) : null}

      {section !== 'overview' ? (
        <AppButton
          variant="text"
          onClick={() => onSectionChange('overview')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to manage options
        </AppButton>
      ) : null}

      {section === 'overview' ? (
        <ManageBookingOverview booking={booking} onSelectSection={onSectionChange} />
      ) : null}

      {section === 'seats' ? (
        <SeatSelectionPanel onSaved={() => handleAncillarySaved('Seats')} />
      ) : null}

      {section === 'baggage' ? (
        <BaggageSelectionPanel
          flightId={booking.flightId}
          cabinClass={booking.cabinClass}
          passengers={passengers}
          onSaved={() => handleAncillarySaved('Baggage')}
        />
      ) : null}

      {section === 'meals' ? (
        <MealSelectionPanel
          flightId={booking.flightId}
          passengers={passengers}
          onSaved={() => handleAncillarySaved('Meals')}
        />
      ) : null}

      {section === 'addons' ? (
        <AddonSelectionPanel
          flightId={booking.flightId}
          passengers={passengers}
          onSaved={() => handleAncillarySaved('Add-ons')}
        />
      ) : null}

      {section === 'contact' ? (
        <ManageContactForm
          booking={booking}
          onSaved={() => {
            setFeedback('Contact details updated.');
            onSectionChange('overview');
          }}
        />
      ) : null}

      {section === 'flight' ? (
        <ManageBookingOverview booking={booking} onSelectSection={onSectionChange} />
      ) : null}
    </Stack>
  );
}
