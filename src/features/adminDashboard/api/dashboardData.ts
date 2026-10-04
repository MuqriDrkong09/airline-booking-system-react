import type { AdminDashboardData } from '../types/dashboard';

function monthLabel(offsetFromNow: number): { date: string; label: string } {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - (5 - offsetFromNow));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return {
    date: `${year}-${month}-01`,
    label: date.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
  };
}

export function createMockAdminDashboardData(): AdminDashboardData {
  const bookingsSeries = [118, 142, 156, 171, 164, 189];
  const revenueSeries = [48200, 53850, 61020, 67240, 64110, 72880];

  return {
    metrics: {
      totalBookings: 1842,
      totalRevenue: 728_880,
      totalUsers: 956,
      activeFlights: 64,
      cancelledFlights: 27,
      completedFlights: 1_318,
      currency: 'USD',
    },
    bookingsOverTime: bookingsSeries.map((value, index) => {
      const point = monthLabel(index);
      return { ...point, value };
    }),
    revenueOverTime: revenueSeries.map((value, index) => {
      const point = monthLabel(index);
      return { ...point, value };
    }),
    popularDestinations: [
      { destination: 'NRT', city: 'Tokyo', bookings: 286 },
      { destination: 'SIN', city: 'Singapore', bookings: 241 },
      { destination: 'BKK', city: 'Bangkok', bookings: 198 },
      { destination: 'ICN', city: 'Seoul', bookings: 167 },
      { destination: 'DXB', city: 'Dubai', bookings: 142 },
      { destination: 'SYD', city: 'Sydney', bookings: 121 },
    ],
    bookingStatusDistribution: [
      { status: 'CONFIRMED', label: 'Confirmed', count: 742 },
      { status: 'CHECKED_IN', label: 'Checked in', count: 318 },
      { status: 'COMPLETED', label: 'Completed', count: 512 },
      { status: 'CANCELLED', label: 'Cancelled', count: 156 },
      { status: 'PENDING', label: 'Pending', count: 84 },
      { status: 'REFUNDED', label: 'Refunded', count: 30 },
    ],
    airlinePerformance: [
      { airline: 'Malaysia Airlines', code: 'MH', bookings: 412, revenue: 186_400, onTimeRate: 0.91 },
      { airline: 'AirAsia', code: 'AK', bookings: 388, revenue: 142_250, onTimeRate: 0.87 },
      { airline: 'Singapore Airlines', code: 'SQ', bookings: 276, revenue: 198_720, onTimeRate: 0.94 },
      { airline: 'Emirates', code: 'EK', bookings: 198, revenue: 156_100, onTimeRate: 0.9 },
      { airline: 'Qatar Airways', code: 'QR', bookings: 164, revenue: 121_480, onTimeRate: 0.92 },
    ],
    generatedAt: new Date().toISOString(),
  };
}
