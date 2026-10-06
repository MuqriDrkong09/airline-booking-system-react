import type { ReactNode } from 'react';
import {
  createMockAdminReportsData,
  EMPTY_REPORT_FILTERS,
  formatCompactNumber,
  formatReportCurrency,
  ReportAirlinePerformanceChart,
  ReportBarChart,
  ReportTimeSeriesChart,
} from '@/features/adminReports';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  reportChartCaptures,
  type TooltipCapture,
  type YAxisCapture,
} from './reportChartCaptures';

jest.mock('recharts', () => {
  const React = require('react') as typeof import('react');
  const {
    reportChartCaptures: captures,
  } = require('./reportChartCaptures') as typeof import('./reportChartCaptures');

  function Passthrough({ children }: { children?: ReactNode }) {
    return React.createElement('div', null, children);
  }

  return {
    ResponsiveContainer: ({ children }: { children?: ReactNode }) =>
      React.createElement('div', { 'data-testid': 'recharts-responsive' }, children),
    AreaChart: Passthrough,
    LineChart: Passthrough,
    BarChart: Passthrough,
    CartesianGrid: () => null,
    XAxis: () => null,
    Legend: () => null,
    Area: () => null,
    Line: () => null,
    Bar: () => null,
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

describe('ReportCharts', () => {
  const seed = createMockAdminReportsData(EMPTY_REPORT_FILTERS);

  beforeEach(() => {
    reportChartCaptures.reset();
  });

  it('renders reusable time-series and bar chart shells', () => {
    renderWithProviders(
      <>
        <ReportTimeSeriesChart
          title="Revenue"
          subtitle="Revenue trend"
          data={seed.revenueSeries}
          seriesName="Revenue"
          variant="line"
          valueFormat="currency"
          currency="USD"
        />
        <ReportBarChart
          title="Popular routes"
          subtitle="Top routes"
          data={seed.popularRoutes.map((route) => ({
            label: route.route,
            value: route.bookings,
          }))}
          seriesName="Bookings"
          layout="horizontal"
        />
      </>,
    );

    expect(document.body).toHaveTextContent('Revenue');
    expect(document.body).toHaveTextContent('Popular routes');
    expect(reportChartCaptures.tooltips.length).toBeGreaterThanOrEqual(2);
  });

  it('formats currency ticks and tooltips on time-series charts', () => {
    renderWithProviders(
      <ReportTimeSeriesChart
        title="Revenue"
        subtitle="Revenue trend"
        data={seed.revenueSeries}
        seriesName="Revenue"
        variant="area"
        valueFormat="currency"
        currency="USD"
      />,
    );

    const tickFormatter = reportChartCaptures.yAxes.find(
      (axis) => axis.tickFormatter,
    )?.tickFormatter;
    expect(tickFormatter).toEqual(expect.any(Function));
    expect(tickFormatter?.(65_000)).toBe(formatCompactNumber(65_000));

    const tooltip = reportChartCaptures.tooltips.find((item) => item.formatter);
    expect(tooltip?.formatter?.(72_880)).toEqual([
      formatReportCurrency(72_880, 'USD'),
      'Revenue',
    ]);
    expect(tooltip?.formatter?.(null)).toEqual([
      formatReportCurrency(0, 'USD'),
      'Revenue',
    ]);
  });

  it('formats airline performance tooltip labels and revenue values', () => {
    renderWithProviders(
      <ReportAirlinePerformanceChart data={seed.airlinePerformance} currency="USD" />,
    );

    expect(document.body).toHaveTextContent('Airline performance');

    const tooltip = reportChartCaptures.tooltips.find((item) => item.formatter);
    expect(tooltip?.formatter?.(156_100, 'Revenue')).toEqual([
      formatReportCurrency(156_100, 'USD'),
      'Revenue',
    ]);
    expect(tooltip?.formatter?.(412, 'Bookings')).toEqual([
      new Intl.NumberFormat(undefined).format(412),
      'Bookings',
    ]);
    expect(tooltip?.labelFormatter?.('MH')).toEqual(
      expect.stringContaining('Malaysia Airlines'),
    );
  });
});
