import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminDashboardKeys,
  formatDashboardCurrency,
  formatDashboardNumber,
} from '@/features/adminDashboard';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { renderWithProviders } from '@tests/utils/test-utils';

jest.mock('recharts', () => {
  const actual = jest.requireActual<typeof import('recharts')>('recharts');

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
      <div data-testid="recharts-responsive">{children}</div>
    ),
  };
});

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    queryClient.removeQueries({ queryKey: adminDashboardKeys.all });
  });

  it('renders KPI cards and chart sections from mock data', async () => {
    renderWithProviders(<AdminDashboardPage />, {
      initialEntries: ['/admin'],
    });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    expect(await screen.findByText('Total bookings')).toBeInTheDocument();
    expect(screen.getByText('Total revenue')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('Active flights')).toBeInTheDocument();
    expect(screen.getByText('Cancelled flights')).toBeInTheDocument();
    expect(screen.getByText('Completed flights')).toBeInTheDocument();

    expect(screen.getByText(formatDashboardNumber(1842))).toBeInTheDocument();
    expect(screen.getByText(formatDashboardCurrency(728_880, 'USD'))).toBeInTheDocument();
    expect(screen.getByText(formatDashboardNumber(956))).toBeInTheDocument();
    expect(screen.getByText(formatDashboardNumber(64))).toBeInTheDocument();
    expect(screen.getByText(formatDashboardNumber(27))).toBeInTheDocument();
    expect(screen.getByText(formatDashboardNumber(1318))).toBeInTheDocument();

    expect(screen.getByText('Bookings over time')).toBeInTheDocument();
    expect(screen.getByText('Revenue over time')).toBeInTheDocument();
    expect(screen.getByText('Popular destinations')).toBeInTheDocument();
    expect(screen.getByText('Booking status distribution')).toBeInTheDocument();
    expect(screen.getByText('Airline performance')).toBeInTheDocument();
  });
});
