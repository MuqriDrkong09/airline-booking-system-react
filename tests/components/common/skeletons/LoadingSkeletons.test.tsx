import { screen } from '@testing-library/react';
import {
  BookingCardSkeleton,
  ChartSkeleton,
  DashboardCardSkeleton,
  DashboardPageSkeleton,
  FlightCardSkeleton,
  FlightDetailsSkeleton,
  ProfileSkeleton,
  SeatMapSkeleton,
  TableSkeleton,
} from '@/components/common';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('loading skeletons', () => {
  it('renders flight card skeletons with an accessible busy status', () => {
    renderWithProviders(<FlightCardSkeleton count={2} />);

    expect(screen.getByRole('status', { name: 'Loading flights' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(4);
  });

  it('renders booking card skeletons', () => {
    renderWithProviders(<BookingCardSkeleton count={1} />);

    expect(screen.getByRole('status', { name: 'Loading bookings' })).toBeInTheDocument();
  });

  it('renders profile skeleton', () => {
    renderWithProviders(<ProfileSkeleton />);

    expect(screen.getByRole('status', { name: 'Loading profile' })).toBeInTheDocument();
  });

  it('renders table skeleton with header and body rows', () => {
    renderWithProviders(<TableSkeleton columnCount={4} rowCount={3} showToolbar={false} />);

    expect(screen.getByRole('status', { name: 'Loading table' })).toBeInTheDocument();
    expect(document.querySelectorAll('thead .MuiSkeleton-root').length).toBe(4);
    expect(document.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('renders dashboard metric and chart skeletons', () => {
    renderWithProviders(
      <>
        <DashboardCardSkeleton count={2} />
        <ChartSkeleton count={1} />
      </>,
    );

    expect(
      screen.getByRole('status', { name: 'Loading dashboard metrics' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading charts' })).toBeInTheDocument();
  });

  it('renders the combined dashboard page skeleton', () => {
    renderWithProviders(<DashboardPageSkeleton />);

    expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument();
  });

  it('renders flight details and seat map skeletons', () => {
    renderWithProviders(
      <>
        <FlightDetailsSkeleton />
        <SeatMapSkeleton />
      </>,
    );

    expect(
      screen.getByRole('status', { name: 'Loading flight details' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading seat map' })).toBeInTheDocument();
  });
});
