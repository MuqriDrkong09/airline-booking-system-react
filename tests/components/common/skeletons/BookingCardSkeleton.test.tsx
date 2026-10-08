import { screen } from '@testing-library/react';
import { BookingCardSkeleton } from '@/components/common/skeletons/BookingCardSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

/** Header meta + route strip + action chips per booking card. */
const SKELETONS_PER_CARD = 10;

describe('BookingCardSkeleton', () => {
  it('renders an accessible busy status labeled for bookings', () => {
    renderWithProviders(<BookingCardSkeleton count={1} />);

    const status = screen.getByRole('status', { name: 'Loading bookings' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('defaults to three booking cards', () => {
    renderWithProviders(<BookingCardSkeleton />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(3);
  });

  it('honors a custom booking count', () => {
    renderWithProviders(<BookingCardSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders outlined cards without headers and with the expected skeleton placeholders', () => {
    renderWithProviders(<BookingCardSkeleton count={1} />);

    const card = document.querySelector('.MuiCard-root');
    expect(card).toBeTruthy();
    expect(card).toHaveClass('MuiPaper-outlined');
    expect(card!.querySelector('.MuiCardHeader-root')).not.toBeInTheDocument();
    expect(card!.querySelectorAll('.MuiSkeleton-root')).toHaveLength(SKELETONS_PER_CARD);
  });

  it('scales skeleton placeholders with the card count', () => {
    renderWithProviders(<BookingCardSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      SKELETONS_PER_CARD * 2,
    );
  });

  it('renders an empty list when count is zero', () => {
    renderWithProviders(<BookingCardSkeleton count={0} />);

    expect(screen.getByRole('status', { name: 'Loading bookings' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(0);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(0);
  });
});
