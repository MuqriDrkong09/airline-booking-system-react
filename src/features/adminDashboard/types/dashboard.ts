export interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeFlights: number;
  cancelledFlights: number;
  completedFlights: number;
  currency: string;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  value: number;
}

export interface DestinationStat {
  destination: string;
  city: string;
  bookings: number;
}

export interface BookingStatusSlice {
  status: string;
  label: string;
  count: number;
}

export interface AirlinePerformanceRow {
  airline: string;
  code: string;
  bookings: number;
  revenue: number;
  onTimeRate: number;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  bookingsOverTime: TimeSeriesPoint[];
  revenueOverTime: TimeSeriesPoint[];
  popularDestinations: DestinationStat[];
  bookingStatusDistribution: BookingStatusSlice[];
  airlinePerformance: AirlinePerformanceRow[];
  generatedAt: string;
}
