import { useTheme } from '@mui/material/styles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REPORT_CHART_COLORS } from '../constants/options';
import type { ReportAirlinePerformance } from '../types/adminReport';
import {
  formatCompactNumber,
  formatReportCurrency,
  formatReportNumber,
  formatReportPercent,
} from '../utils/formatReport';
import { ReportChartCard } from './ReportChartCard';

export interface ReportAirlinePerformanceChartProps {
  data: readonly ReportAirlinePerformance[];
  currency?: string;
}

export function ReportAirlinePerformanceChart({
  data,
  currency = 'USD',
}: ReportAirlinePerformanceChartProps) {
  const theme = useTheme();
  const chartData = data.map((row) => ({
    name: row.code,
    airline: row.airline,
    bookings: row.bookings,
    revenue: row.revenue,
    passengers: row.passengers,
    cancellations: row.cancellations,
    onTimeRate: row.onTimeRate,
  }));

  return (
    <ReportChartCard
      title="Airline performance"
      subtitle="Bookings, revenue, and cancellation volume by carrier."
      height={{ xs: 320, md: 360 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            width={48}
            tickFormatter={(value: number) => formatCompactNumber(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            width={56}
            tickFormatter={(value: number) => formatCompactNumber(value)}
          />
          <Tooltip
            formatter={(value, name) => {
              const numeric = Number(value ?? 0);
              if (name === 'Revenue') {
                return [formatReportCurrency(numeric, currency), name];
              }
              return [formatReportNumber(numeric), String(name)];
            }}
            labelFormatter={(label) => {
              const row = chartData.find((item) => item.name === label);
              return row
                ? `${row.airline} (${row.name}) · On-time ${formatReportPercent(row.onTimeRate)}`
                : String(label);
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="bookings"
            name="Bookings"
            fill={REPORT_CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="cancellations"
            name="Cancellations"
            fill={REPORT_CHART_COLORS[3]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            name="Revenue"
            fill={REPORT_CHART_COLORS[1]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ReportChartCard>
  );
}
