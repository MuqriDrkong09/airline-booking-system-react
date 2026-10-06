import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Ban,
  Banknote,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { AppAlert, ErrorState, PageLoader } from '@/components/common';
import { REPORT_CHART_COLORS } from '../constants/options';
import { useAdminReportsQuery } from '../hooks/useAdminReports';
import {
  EMPTY_REPORT_FILTERS,
  type ReportFilters,
} from '../types/adminReport';
import {
  formatReportCurrency,
  formatReportNumber,
} from '../utils/formatReport';
import { isCustomRangeReady } from '../utils/reportDateRange';
import { ReportAirlinePerformanceChart } from './ReportAirlinePerformanceChart';
import { ReportBarChart } from './ReportBarChart';
import { ReportMetricCard } from './ReportMetricCard';
import { ReportPeriodFilter } from './ReportPeriodFilter';
import { ReportTimeSeriesChart } from './ReportTimeSeriesChart';

export function AdminReportsView() {
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_REPORT_FILTERS);
  const query = useAdminReportsQuery(filters);
  const customReady = isCustomRangeReady(filters);

  if (!customReady) {
    return (
      <Stack spacing={3}>
        <ReportPeriodFilter value={filters} onChange={setFilters} />
        <AppAlert severity="info">
          Choose a valid custom date range (from date on or before to date) to load reports.
        </AppAlert>
      </Stack>
    );
  }

  if (query.isLoading && !query.data) {
    return (
      <Stack spacing={3}>
        <ReportPeriodFilter value={filters} onChange={setFilters} />
        <PageLoader label="Loading reports" />
      </Stack>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Stack spacing={3}>
        <ReportPeriodFilter value={filters} onChange={setFilters} />
        <ErrorState
          title="Unable to load reports"
          message="Please try again in a moment."
          onRetry={() => {
            void query.refetch();
          }}
        />
      </Stack>
    );
  }

  const { summary, range, generatedAt } = query.data;
  const generatedLabel = new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Stack spacing={3}>
      <ReportPeriodFilter value={filters} onChange={setFilters} />

      <Typography variant="body2" color="text.secondary">
        {range.startDate} → {range.endDate} · Updated {generatedLabel}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
        <ReportMetricCard
          label="Revenue"
          value={formatReportCurrency(summary.revenue, summary.currency)}
          helperText="Ticket revenue in range"
          icon={Wallet}
          tone="success"
        />
        <ReportMetricCard
          label="Bookings"
          value={formatReportNumber(summary.bookings)}
          helperText="Created bookings"
          icon={Ticket}
          tone="info"
        />
        <ReportMetricCard
          label="Passengers"
          value={formatReportNumber(summary.passengers)}
          helperText="Travelled seats"
          icon={Users}
        />
        <ReportMetricCard
          label="Cancellations"
          value={formatReportNumber(summary.cancellations)}
          helperText="Cancelled bookings"
          icon={Ban}
          tone="error"
        />
        <ReportMetricCard
          label="Refunds"
          value={formatReportNumber(summary.refunds)}
          helperText={formatReportCurrency(summary.refundAmount, summary.currency)}
          icon={Banknote}
          tone="warning"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <ReportTimeSeriesChart
          title="Revenue"
          subtitle="Revenue trend for the selected period."
          data={query.data.revenueSeries}
          seriesName="Revenue"
          variant="line"
          color={REPORT_CHART_COLORS[1]}
          valueFormat="currency"
          currency={summary.currency}
        />
        <ReportTimeSeriesChart
          title="Bookings"
          subtitle="Booking volume over time."
          data={query.data.bookingsSeries}
          seriesName="Bookings"
          variant="area"
          color={REPORT_CHART_COLORS[0]}
        />
        <ReportTimeSeriesChart
          title="Passengers"
          subtitle="Passenger counts associated with bookings."
          data={query.data.passengersSeries}
          seriesName="Passengers"
          variant="area"
          color={REPORT_CHART_COLORS[4]}
        />
        <ReportTimeSeriesChart
          title="Cancellations"
          subtitle="Cancelled bookings over time."
          data={query.data.cancellationsSeries}
          seriesName="Cancellations"
          variant="line"
          color={REPORT_CHART_COLORS[3]}
        />
        <ReportTimeSeriesChart
          title="Refunds"
          subtitle="Refunded bookings over time."
          data={query.data.refundsSeries}
          seriesName="Refunds"
          variant="line"
          color={REPORT_CHART_COLORS[2]}
        />
        <ReportBarChart
          title="Popular routes"
          subtitle="Top origin–destination pairs by bookings."
          data={query.data.popularRoutes.map((route) => ({
            label: route.route,
            value: route.bookings,
          }))}
          seriesName="Bookings"
          layout="horizontal"
          color={REPORT_CHART_COLORS[0]}
        />
        <ReportBarChart
          title="Popular destinations"
          subtitle="Most requested arrival cities."
          data={query.data.popularDestinations.map((destination) => ({
            label: destination.destination,
            value: destination.bookings,
          }))}
          seriesName="Bookings"
          layout="horizontal"
          color={REPORT_CHART_COLORS[5]}
        />
        <Box sx={{ gridColumn: { xs: 'auto', lg: '1 / -1' } }}>
          <ReportAirlinePerformanceChart
            data={query.data.airlinePerformance}
            currency={summary.currency}
          />
        </Box>
      </Box>
    </Stack>
  );
}
