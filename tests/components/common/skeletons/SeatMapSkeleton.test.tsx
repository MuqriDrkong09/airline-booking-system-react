import { screen } from '@testing-library/react';
import { SeatMapSkeleton } from '@/components/common/skeletons/SeatMapSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

const LEGEND_SKELETONS = 6;
const SEAT_ROWS = 10;
const SEATS_PER_ROW = 6;
const ROW_LABELS_PER_ROW = 2;
const MAP_HEADER_SKELETONS = 2; // title + subtitle
const MAP_SKELETONS =
  MAP_HEADER_SKELETONS +
  LEGEND_SKELETONS +
  SEAT_ROWS * (ROW_LABELS_PER_ROW + SEATS_PER_ROW);
const INSPECTOR_SKELETONS = 6; // title + 5 body placeholders

describe('SeatMapSkeleton', () => {
  it('renders an accessible busy status labeled for the seat map', () => {
    renderWithProviders(<SeatMapSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading seat map' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('shows the map and inspector cards by default', () => {
    renderWithProviders(<SeatMapSkeleton />);

    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(2);
    expect(cards[0]!.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(cards[1]!.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
  });

  it('renders legend, seat grid, and inspector skeleton placeholders when inspector is visible', () => {
    renderWithProviders(<SeatMapSkeleton />);

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      MAP_SKELETONS + INSPECTOR_SKELETONS,
    );
    expect(document.querySelectorAll('.MuiSkeleton-rounded')).toHaveLength(
      SEAT_ROWS * SEATS_PER_ROW,
    );
  });

  it('hides the inspector column when showInspector is false', () => {
    renderWithProviders(<SeatMapSkeleton showInspector={false} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(1);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(MAP_SKELETONS);
    expect(document.querySelectorAll('.MuiSkeleton-rounded')).toHaveLength(
      SEAT_ROWS * SEATS_PER_ROW,
    );
  });

  it('keeps the map card header and seat placeholders when inspector is hidden', () => {
    renderWithProviders(<SeatMapSkeleton showInspector={false} />);

    const card = document.querySelector('.MuiCard-root');
    expect(card).toBeTruthy();
    expect(card).toHaveClass('MuiPaper-outlined');
    expect(card!.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(card!.querySelectorAll('.MuiSkeleton-root')).toHaveLength(MAP_SKELETONS);
  });
});
