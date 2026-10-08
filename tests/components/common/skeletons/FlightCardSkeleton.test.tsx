import { screen } from '@testing-library/react';
import {
  FlightCardSkeleton,
  FlightResultsSkeleton,
} from '@/components/common/skeletons/FlightCardSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

/** Airline row + route strip + fare line + action buttons. */
const SKELETONS_PER_CARD = 10;

describe('FlightCardSkeleton', () => {
  it('renders an accessible busy status labeled for flights', () => {
    renderWithProviders(<FlightCardSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading flights' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('defaults to a single flight card in a stacked list', () => {
    renderWithProviders(<FlightCardSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading flights' });
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(1);
    expect(status.querySelector(':scope > .MuiStack-root')).toBeInTheDocument();
    expect(status.querySelector(':scope > .MuiBox-root')).not.toBeInTheDocument();
  });

  it('honors a custom flight count', () => {
    renderWithProviders(<FlightCardSkeleton count={3} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(3);
  });

  it('renders outlined cards with circular airline mark and expected skeletons', () => {
    renderWithProviders(<FlightCardSkeleton count={1} />);

    const card = document.querySelector('.MuiCard-root');
    expect(card).toBeTruthy();
    expect(card).toHaveClass('MuiPaper-outlined');
    expect(card!.querySelector('.MuiCardHeader-root')).not.toBeInTheDocument();
    expect(card!.querySelectorAll('.MuiSkeleton-root')).toHaveLength(SKELETONS_PER_CARD);
    expect(card!.querySelectorAll('.MuiSkeleton-circular')).toHaveLength(1);
  });

  it('scales skeleton placeholders with the card count', () => {
    renderWithProviders(<FlightCardSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      SKELETONS_PER_CARD * 2,
    );
  });

  it('switches to a grid layout when columns are provided', () => {
    renderWithProviders(
      <FlightCardSkeleton count={2} columns={{ xs: 1, sm: 2, lg: 3 }} />,
    );

    const status = screen.getByRole('status', { name: 'Loading flights' });
    expect(status.querySelector(':scope > .MuiBox-root')).toBeInTheDocument();
    expect(status.querySelector(':scope > .MuiStack-root')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders when only xs columns are provided', () => {
    renderWithProviders(<FlightCardSkeleton count={2} columns={{ xs: 2 }} />);

    expect(screen.getByRole('status', { name: 'Loading flights' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders an empty list when count is zero', () => {
    renderWithProviders(<FlightCardSkeleton count={0} />);

    expect(screen.getByRole('status', { name: 'Loading flights' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(0);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(0);
  });
});

describe('FlightResultsSkeleton', () => {
  it('defaults to three stacked flight cards', () => {
    renderWithProviders(<FlightResultsSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading flights' });
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(3);
    expect(status.querySelector(':scope > .MuiStack-root')).toBeInTheDocument();
  });

  it('forwards a custom count to FlightCardSkeleton', () => {
    renderWithProviders(<FlightResultsSkeleton count={1} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(1);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(SKELETONS_PER_CARD);
  });
});
