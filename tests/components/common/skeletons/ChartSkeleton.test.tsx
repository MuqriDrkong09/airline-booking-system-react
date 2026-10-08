import { screen } from '@testing-library/react';
import { ChartSkeleton } from '@/components/common/skeletons/ChartSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

const BARS_PER_CHART = 7;
const SKELETONS_PER_CHART = 2 + BARS_PER_CHART + 1; // title + subtitle + bars + axis

function getPlotArea(): HTMLElement {
  const plot = document.querySelector('.MuiCardContent-root > .MuiBox-root');
  expect(plot).toBeTruthy();
  return plot as HTMLElement;
}

describe('ChartSkeleton', () => {
  it('renders an accessible busy status labeled for charts', () => {
    renderWithProviders(<ChartSkeleton count={1} />);

    const status = screen.getByRole('status', { name: 'Loading charts' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('defaults to four chart cards', () => {
    renderWithProviders(<ChartSkeleton />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(4);
  });

  it('honors a custom chart count', () => {
    renderWithProviders(<ChartSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders outlined cards with title, subtitle, bar, and axis skeletons', () => {
    renderWithProviders(<ChartSkeleton count={1} />);

    const card = document.querySelector('.MuiCard-root');
    expect(card).toBeTruthy();
    expect(card).toHaveClass('MuiPaper-outlined');
    expect(card!.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(card!.querySelectorAll('.MuiSkeleton-root')).toHaveLength(SKELETONS_PER_CHART);
    expect(card!.querySelectorAll('.MuiSkeleton-rounded')).toHaveLength(BARS_PER_CHART);
  });

  it('scales skeleton placeholders with the chart count', () => {
    renderWithProviders(<ChartSkeleton count={2} />);

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      SKELETONS_PER_CHART * 2,
    );
  });

  it('uses the default md height when height is omitted', () => {
    renderWithProviders(<ChartSkeleton count={1} />);

    expect(getPlotArea()).toHaveStyle({ height: '300px', minHeight: '260px' });
  });

  it('applies a numeric chart height to the plot area', () => {
    renderWithProviders(<ChartSkeleton count={1} height={320} />);

    expect(getPlotArea()).toHaveStyle({ height: '320px', minHeight: '260px' });
  });

  it('uses the md height when height is provided as a breakpoint object', () => {
    renderWithProviders(<ChartSkeleton count={1} height={{ xs: 240, md: 310 }} />);

    expect(getPlotArea()).toHaveStyle({ height: '310px' });
  });

  it('falls back to xs height when md is omitted from the height object', () => {
    renderWithProviders(<ChartSkeleton count={1} height={{ xs: 250 }} />);

    expect(getPlotArea()).toHaveStyle({ height: '250px' });
  });

  it('falls back to 280px when the height object has no xs or md values', () => {
    renderWithProviders(<ChartSkeleton count={1} height={{}} />);

    expect(getPlotArea()).toHaveStyle({ height: '280px' });
  });

  it('renders with custom grid column props without changing card count', () => {
    renderWithProviders(<ChartSkeleton count={3} columns={{ xs: 1, lg: 3 }} />);

    expect(screen.getByRole('status', { name: 'Loading charts' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(3);
  });

  it('renders when only xs columns are provided', () => {
    renderWithProviders(<ChartSkeleton count={2} columns={{ xs: 2 }} />);

    expect(screen.getByRole('status', { name: 'Loading charts' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(2);
  });

  it('renders an empty grid when count is zero', () => {
    renderWithProviders(<ChartSkeleton count={0} />);

    expect(screen.getByRole('status', { name: 'Loading charts' })).toBeInTheDocument();
    expect(document.querySelectorAll('.MuiCard-root')).toHaveLength(0);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(0);
  });
});
