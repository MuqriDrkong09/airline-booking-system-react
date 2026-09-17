import { screen } from '@testing-library/react';
import { ProfileView } from '@/features/profile';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/types/profile';
import { renderWithProviders } from '@tests/utils/test-utils';
import { mockCustomerUser } from '@tests/utils/authTestUtils';

describe('ProfileView', () => {
  it('renders profile details and travel preferences', () => {
    renderWithProviders(
      <ProfileView
        user={{
          ...mockCustomerUser,
          title: 'MR',
          phone: '+1 555 0100',
          dateOfBirth: '1990-04-12',
          nationality: 'US',
          travelPreferences: {
            ...DEFAULT_TRAVEL_PREFERENCES,
            preferredCabin: 'BUSINESS',
            seatPreference: 'WINDOW',
          },
        }}
      />,
    );

    expect(screen.getByText('Alex Traveler')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555 0100')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Window')).toBeInTheDocument();
  });
});
