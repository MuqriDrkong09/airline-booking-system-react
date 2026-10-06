import { useTheme } from '@mui/material/styles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REPORT_CHART_COLORS } from '../constants/options';
import { formatCompactNumber, formatReportCurrency, formatReportNumber } from '../utils/formatReport';
import { ReportChartCard } from './ReportChartCard';

export interface ReportBarDatum {
  label: string;
  value: number;
}

export interface ReportBarChartProps {
  title: string;
  subtitle: string;
  data: readonly ReportBarDatum[];
  seriesName: string;
  layout?: 'vertical' | 'horizontal';
  color?: string;
  valueFormat?: 'number' | 'currency';
  currency?: string;
}

export function ReportBarChart({
  title,
  subtitle,
  data,
  seriesName,
  layout = 'vertical',
  color = REPORT_CHART_COLORS[2],
  valueFormat = 'number',
  currency = 'USD',
}: ReportBarChartProps) {
  const theme = useTheme();
  const chartData = data.map((item) => ({ name: item.label, value: item.value }));

  const formatValue = (value: number) =>
    valueFormat === 'currency'
      ? formatReportCurrency(value, currency)
      : formatReportNumber(value);

  return (
    <ReportChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout === 'horizontal' ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                width={48}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
            </>
          )}
          <Tooltip formatter={(value) => [formatValue(Number(value ?? 0)), seriesName]} />
          <Bar dataKey="value" name={seriesName} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ReportChartCard>
  );
}
