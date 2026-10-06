import type { ReactNode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Wallet } from 'lucide-react';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminReportKeys,
  adminReportsApi,
  createMockAdminReportsData,
  EMPTY_REPORT_FILTERS,
  formatReportCurrency,
  formatReportNumber,
  ReportMetricCard,
} from '@/features/adminReports';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
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

describe('AdminReportsPage', () => {
  beforeEach(() => {
    queryClient.removeQueries({ queryKey: adminReportKeys.all });
    jest.restoreAllMocks();
  });

  it('renders KPI cards, period filters, and report chart sections', async () => {
    const seed = createMockAdminReportsData(EMPTY_REPORT_FILTERS);

    renderWithProviders(<AdminReportsPage />, {
      initialEntries: ['/admin/reports'],
    });

    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3 months' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12 months' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();

    expect(await screen.findByText('Ticket revenue in range')).toBeInTheDocument();
    expect(screen.getByText('Created bookings')).toBeInTheDocument();
    expect(screen.getByText('Travelled seats')).toBeInTheDocument();
    expect(screen.getByText('Cancelled bookings')).toBeInTheDocument();
    expect(
      screen.getByText(formatReportCurrency(seed.summary.refundAmount, seed.summary.currency)),
    ).toBeInTheDocument();

    expect(
      screen.getByText(formatReportCurrency(seed.summary.revenue, seed.summary.currency)),
    ).toBeInTheDocument();
    expect(screen.getByText(formatReportNumber(seed.summary.bookings))).toBeInTheDocument();
    expect(screen.getByText(formatReportNumber(seed.summary.passengers))).toBeInTheDocument();
    expect(
      screen.getByText(formatReportNumber(seed.summary.cancellations)),
    ).toBeInTheDocument();
    expect(screen.getByText(formatReportNumber(seed.summary.refunds))).toBeInTheDocument();

    expect(screen.getByText('Popular routes')).toBeInTheDocument();
    expect(screen.getByText('Popular destinations')).toBeInTheDocument();
    expect(screen.getByText('Airline performance')).toBeInTheDocument();
    expect(screen.getAllByText('Revenue').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Bookings').length).toBeGreaterThanOrEqual(2);
  });

  it('shows custom date inputs when Custom is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminReportsPage />, {
      initialEntries: ['/admin/reports'],
    });

    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Custom' }));

    expect(
      await screen.findByText(
        /Choose a valid custom date range/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('From date')).toBeInTheDocument();
    expect(screen.getByLabelText('To date')).toBeInTheDocument();
  });

  it('shows an error state and retries the reports query', async () => {
    const user = userEvent.setup();
    const getReports = jest
      .spyOn(adminReportsApi, 'getReports')
      .mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminReportsPage />, {
      initialEntries: ['/admin/reports'],
    });

    expect(
      await screen.findByText('Unable to load reports', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    getReports.mockResolvedValue(createMockAdminReportsData(EMPTY_REPORT_FILTERS));
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('Popular routes')).toBeInTheDocument();
    });
    expect(getReports.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});

describe('ReportMetricCard', () => {
  it('renders without helper text', () => {
    renderWithProviders(
      <ReportMetricCard label="Revenue" value="$10" icon={Wallet} />,
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
  });
});
