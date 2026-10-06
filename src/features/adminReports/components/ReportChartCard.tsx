import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { AppCard } from '@/components/common';

export interface ReportChartCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  height?: { xs?: number; md?: number } | number;
}

export function ReportChartCard({
  title,
  subtitle,
  children,
  height = { xs: 260, md: 300 },
}: ReportChartCardProps) {
  return (
    <AppCard title={title} subtitle={subtitle} sx={{ height: '100%' }}>
      <Box sx={{ width: '100%', height, minHeight: 260 }}>{children}</Box>
    </AppCard>
  );
}
