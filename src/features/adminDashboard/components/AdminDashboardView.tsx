import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  CheckCircle2,
  CircleX,
  Plane,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { DashboardPageSkeleton, ErrorState } from '@/components/common';
import { useAdminDashboardQuery } from '../hooks/useAdminDashboard';
import {
  formatDashboardCurrency,
  formatDashboardNumber,
} from '../utils/formatDashboard';
import {
  AirlinePerformanceChart,
  BookingStatusChart,
  BookingsOverTimeChart,
  PopularDestinationsChart,
  RevenueOverTimeChart,
} from './DashboardCharts';
import { DashboardMetricCard } from './DashboardMetricCard';

export function AdminDashboardView() {
  const query = useAdminDashboardQuery();

  if (query.isLoading) {
    return <DashboardPageSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message="Please try again in a moment."
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const { metrics, generatedAt } = query.data;
  const generatedLabel = new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Snapshot updated {generatedLabel}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <DashboardMetricCard
          label="Total bookings"
          value={formatDashboardNumber(metrics.totalBookings)}
          helperText="All booking statuses"
          icon={Ticket}
          tone="info"
        />
        <DashboardMetricCard
          label="Total revenue"
          value={formatDashboardCurrency(metrics.totalRevenue, metrics.currency)}
          helperText="Ticket revenue to date"
          icon={Wallet}
          tone="success"
        />
        <DashboardMetricCard
          label="Total users"
          value={formatDashboardNumber(metrics.totalUsers)}
          helperText="Registered accounts"
          icon={Users}
        />
        <DashboardMetricCard
          label="Active flights"
          value={formatDashboardNumber(metrics.activeFlights)}
          helperText="Scheduled or in progress"
          icon={Plane}
          tone="info"
        />
        <DashboardMetricCard
          label="Cancelled flights"
          value={formatDashboardNumber(metrics.cancelledFlights)}
          helperText="Cancelled in the system"
          icon={CircleX}
          tone="error"
        />
        <DashboardMetricCard
          label="Completed flights"
          value={formatDashboardNumber(metrics.completedFlights)}
          helperText="Arrived and closed"
          icon={CheckCircle2}
          tone="success"
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
        <BookingsOverTimeChart data={query.data.bookingsOverTime} />
        <RevenueOverTimeChart
          data={query.data.revenueOverTime}
          currency={metrics.currency}
        />
        <PopularDestinationsChart data={query.data.popularDestinations} />
        <BookingStatusChart data={query.data.bookingStatusDistribution} />
        <Box sx={{ gridColumn: { xs: 'auto', lg: '1 / -1' } }}>
          <AirlinePerformanceChart
            data={query.data.airlinePerformance}
            currency={metrics.currency}
          />
        </Box>
      </Box>
    </Stack>
  );
}
