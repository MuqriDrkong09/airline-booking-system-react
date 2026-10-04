import type { ComponentProps, ReactNode } from 'react';
import {
  AirlinePerformanceChart,
  BookingStatusChart,
  BookingsOverTimeChart,
  PopularDestinationsChart,
  RevenueOverTimeChart,
  createMockAdminDashboardData,
  formatDashboardCurrency,
} from '@/features/adminDashboard';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  dashboardChartCaptures,
  type TooltipCapture,
  type YAxisCapture,
} from './dashboardChartCaptures';

jest.mock('recharts', () => {
  const React = require('react') as typeof import('react');
  const {
    dashboardChartCaptures: captures,
  } = require('./dashboardChartCaptures') as typeof import('./dashboardChartCaptures');

  function Passthrough({ children }: { children?: ReactNode }) {
    return React.createElement('div', null, children);
  }

  return {
    ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
      React.createElement('div', { 'data-testid': 'recharts-responsive' }, children),
    AreaChart: Passthrough,
    LineChart: Passthrough,
    BarChart: Passthrough,
    PieChart: Passthrough,
    CartesianGrid: () => null,
    XAxis: () => null,
    Legend: () => null,
    Area: () => null,
    Line: () => null,
    Bar: () => null,
    Cell: () => null,
    Pie: ({ children }: { children?: ReactNode }) =>
      React.createElement('div', null, children),
    YAxis: (props: YAxisCapture) => {
      captures.yAxes.push(props);
      return React.createElement('div', { 'data-testid': 'recharts-yaxis' });
    },
    Tooltip: (props: TooltipCapture) => {
      captures.tooltips.push(props);
      return React.createElement('div', { 'data-testid': 'recharts-tooltip' });
    },
  };
});

describe('DashboardCharts', () => {
  const seed = createMockAdminDashboardData();

  beforeEach(() => {
    dashboardChartCaptures.reset();
  });

  it('renders bookings over time and booking status charts', () => {
    renderWithProviders(
      <>
        <BookingsOverTimeChart data={seed.bookingsOverTime} />
        <BookingStatusChart data={seed.bookingStatusDistribution} />
      </>,
    );

    expect(document.body).toHaveTextContent('Bookings over time');
    expect(document.body).toHaveTextContent('Booking status distribution');
    expect(dashboardChartCaptures.tooltips.length).toBeGreaterThanOrEqual(2);
  });

  it('formats revenue axis ticks and tooltip values', () => {
    renderWithProviders(
      <RevenueOverTimeChart data={seed.revenueOverTime} currency="USD" />,
    );

    const tickFormatter = dashboardChartCaptures.yAxes.find(
      (axis) => axis.tickFormatter,
    )?.tickFormatter;
    expect(tickFormatter).toEqual(expect.any(Function));
    expect(tickFormatter?.(65_000)).toBe(
      new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(65_000),
    );

    const tooltip = dashboardChartCaptures.tooltips.find((item) => item.formatter);
    expect(tooltip?.formatter?.(72_880)).toEqual([
      formatDashboardCurrency(72_880, 'USD'),
      'Revenue',
    ]);
    expect(tooltip?.formatter?.(null)).toEqual([
      formatDashboardCurrency(0, 'USD'),
      'Revenue',
    ]);
  });

  it('formats popular destination tooltips with and without payload', () => {
    renderWithProviders(<PopularDestinationsChart data={seed.popularDestinations} />);

    const tooltip = dashboardChartCaptures.tooltips.find(
      (item) => item.formatter && item.labelFormatter,
    );
    expect(tooltip?.formatter?.(286)).toEqual([286, 'Bookings']);

    const destination = seed.popularDestinations[0]!;
    expect(
      tooltip?.labelFormatter?.('NRT', [{ payload: destination }]),
    ).toBe(`${destination.city} (${destination.destination})`);
    expect(tooltip?.labelFormatter?.('NRT', [])).toBe('');
    expect(tooltip?.labelFormatter?.('NRT')).toBe('');
  });

  it('formats airline performance ticks and dual-series tooltips', () => {
    renderWithProviders(
      <AirlinePerformanceChart data={seed.airlinePerformance} currency="USD" />,
    );

    const revenueAxis = dashboardChartCaptures.yAxes.find(
      (axis) => axis.yAxisId === 'revenue' || axis.orientation === 'right',
    );
    expect(revenueAxis?.tickFormatter?.(156_100)).toBe(
      new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(156_100),
    );

    const tooltip = dashboardChartCaptures.tooltips.find(
      (item) => item.formatter && item.labelFormatter,
    );

    expect(tooltip?.formatter?.(412, 'Bookings')).toEqual([412, 'Bookings']);
    expect(tooltip?.formatter?.(186_400, 'Revenue')).toEqual([
      formatDashboardCurrency(186_400, 'USD'),
      'Revenue',
    ]);
    expect(tooltip?.formatter?.(null, 'Revenue')).toEqual([
      formatDashboardCurrency(0, 'USD'),
      'Revenue',
    ]);

    const airline = seed.airlinePerformance[0]!;
    expect(
      tooltip?.labelFormatter?.('MH', [{ payload: airline }]),
    ).toBe(`${airline.airline} · on-time ${Math.round(airline.onTimeRate * 100)}%`);
    expect(tooltip?.labelFormatter?.('MH', [])).toBe('');
    expect(tooltip?.labelFormatter?.('MH')).toBe('');
  });

  it('accepts empty chart datasets without throwing', () => {
    const emptySeries = [] as ComponentProps<typeof BookingsOverTimeChart>['data'];

    expect(() => {
      renderWithProviders(
        <>
          <BookingsOverTimeChart data={emptySeries} />
          <RevenueOverTimeChart data={emptySeries} currency="USD" />
          <PopularDestinationsChart data={[]} />
          <BookingStatusChart data={[]} />
          <AirlinePerformanceChart data={[]} currency="USD" />
        </>,
      );
    }).not.toThrow();
  });
});
