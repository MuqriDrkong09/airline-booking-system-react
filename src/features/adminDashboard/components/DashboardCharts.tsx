import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppCard } from '@/components/common';
import type {
  AirlinePerformanceRow,
  BookingStatusSlice,
  DestinationStat,
  TimeSeriesPoint,
} from '../types/dashboard';
import { DASHBOARD_CHART_COLORS, formatDashboardCurrency } from '../utils/formatDashboard';

const CHART_HEIGHT = { xs: 260, md: 300 };

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AppCard title={title} subtitle={subtitle} sx={{ height: '100%' }}>
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: 260 }}>{children}</Box>
    </AppCard>
  );
}

export function BookingsOverTimeChart({ data }: { data: TimeSeriesPoint[] }) {
  const theme = useTheme();

  return (
    <ChartShell title="Bookings over time" subtitle="Monthly confirmed booking volume.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={40} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            name="Bookings"
            stroke={DASHBOARD_CHART_COLORS[0]}
            fill={DASHBOARD_CHART_COLORS[0]}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function RevenueOverTimeChart({
  data,
  currency,
}: {
  data: TimeSeriesPoint[];
  currency: string;
}) {
  const theme = useTheme();

  return (
    <ChartShell title="Revenue over time" subtitle="Monthly ticket revenue.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            width={56}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat(undefined, {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value) => [
              formatDashboardCurrency(Number(value ?? 0), currency),
              'Revenue',
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Revenue"
            stroke={DASHBOARD_CHART_COLORS[1]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PopularDestinationsChart({ data }: { data: DestinationStat[] }) {
  const theme = useTheme();

  return (
    <ChartShell title="Popular destinations" subtitle="Top destinations by booking count.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="destination"
            tick={{ fontSize: 12 }}
            width={48}
          />
          <Tooltip
            formatter={(value) => [value, 'Bookings']}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as DestinationStat | undefined;
              return row ? `${row.city} (${row.destination})` : '';
            }}
          />
          <Bar dataKey="bookings" name="Bookings" fill={DASHBOARD_CHART_COLORS[2]} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function BookingStatusChart({ data }: { data: BookingStatusSlice[] }) {
  return (
    <ChartShell title="Booking status distribution" subtitle="Share of bookings by current status.">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.status}
                fill={DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function AirlinePerformanceChart({
  data,
  currency,
}: {
  data: AirlinePerformanceRow[];
  currency: string;
}) {
  const theme = useTheme();

  return (
    <ChartShell title="Airline performance" subtitle="Bookings and revenue by airline.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="code" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="bookings" orientation="left" tick={{ fontSize: 12 }} width={40} />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 12 }}
            width={48}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat(undefined, {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'Revenue') {
                return [formatDashboardCurrency(Number(value ?? 0), currency), name];
              }
              return [value, name];
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as AirlinePerformanceRow | undefined;
              return row
                ? `${row.airline} · on-time ${Math.round(row.onTimeRate * 100)}%`
                : '';
            }}
          />
          <Legend />
          <Bar
            yAxisId="bookings"
            dataKey="bookings"
            name="Bookings"
            fill={DASHBOARD_CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            name="Revenue"
            fill={DASHBOARD_CHART_COLORS[4]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
