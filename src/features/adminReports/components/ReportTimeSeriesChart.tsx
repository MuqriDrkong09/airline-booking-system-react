import { useTheme } from '@mui/material/styles';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REPORT_CHART_COLORS } from '../constants/options';
import type { ReportTimeSeriesPoint } from '../types/adminReport';
import { formatCompactNumber, formatReportCurrency, formatReportNumber } from '../utils/formatReport';
import { ReportChartCard } from './ReportChartCard';

export interface ReportTimeSeriesChartProps {
  title: string;
  subtitle: string;
  data: readonly ReportTimeSeriesPoint[];
  seriesName: string;
  variant?: 'area' | 'line';
  color?: string;
  valueFormat?: 'number' | 'currency';
  currency?: string;
}

export function ReportTimeSeriesChart({
  title,
  subtitle,
  data,
  seriesName,
  variant = 'area',
  color = REPORT_CHART_COLORS[0],
  valueFormat = 'number',
  currency = 'USD',
}: ReportTimeSeriesChartProps) {
  const theme = useTheme();
  const chartData = [...data];

  const formatValue = (value: number) =>
    valueFormat === 'currency'
      ? formatReportCurrency(value, currency)
      : formatReportNumber(value);

  const chart =
    variant === 'line' ? (
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          width={56}
          tickFormatter={(value: number) => formatCompactNumber(value)}
        />
        <Tooltip formatter={(value) => [formatValue(Number(value ?? 0)), seriesName]} />
        <Line
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    ) : (
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          width={56}
          tickFormatter={(value: number) => formatCompactNumber(value)}
        />
        <Tooltip formatter={(value) => [formatValue(Number(value ?? 0)), seriesName]} />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    );

  return (
    <ReportChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </ReportChartCard>
  );
}
