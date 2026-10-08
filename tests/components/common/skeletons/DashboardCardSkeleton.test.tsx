import { screen } from '@testing-library/react';
import { DashboardCardSkeleton } from '@/components/common/skeletons/DashboardCardSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

/** Icon tile + label + metric value + helper text. */
const SKELETONS_PER_CARD = 4;

describe('DashboardCardSkeleton', () => {
  it('renders an accessible busy status labeled for dashboard metrics', () => {
    renderWithProviders(<DashboardCardSkeleton count={1} />);

    const status = screen.getByRole('status', { name: 'Loading dashboard metrics' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('defaults to six metric cards', () => {
    renderWithProviders(<DashboardCardSkeleton />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(6);
  });

  it('honors a custom metric count', () => {
    renderWithProviders(<DashboardCardSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders outlined cards with icon, label, value, and helper skeletons', () => {
    renderWithProviders(<DashboardCardSkeleton count={1} />);

    const card = document.querySelector('.MuiCard-root');
    expect(card).toBeTruthy();
    expect(card).toHaveClass('MuiPaper-outlined');
    expect(card!.querySelector('.MuiCardHeader-root')).not.toBeInTheDocument();
    expect(card!.querySelectorAll('.MuiSkeleton-root')).toHaveLength(SKELETONS_PER_CARD);
    expect(card!.querySelectorAll('.MuiSkeleton-rounded')).toHaveLength(1);
  });

  it('scales skeleton placeholders with the card count', () => {
    renderWithProviders(<DashboardCardSkeleton count={3} />);

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      SKELETONS_PER_CARD * 3,
    );
  });

  it('renders with custom grid column props without changing card count', () => {
    renderWithProviders(
      <DashboardCardSkeleton count={4} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} />,
    );

    expect(
      screen.getByRole('status', { name: 'Loading dashboard metrics' }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(4);
  });

  it('renders when only xs columns are provided', () => {
    renderWithProviders(<DashboardCardSkeleton count={2} columns={{ xs: 2 }} />);

    expect(
      screen.getByRole('status', { name: 'Loading dashboard metrics' }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders an empty grid when count is zero', () => {
    renderWithProviders(<DashboardCardSkeleton count={0} />);

    expect(
      screen.getByRole('status', { name: 'Loading dashboard metrics' }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(0);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(0);
  });
});
