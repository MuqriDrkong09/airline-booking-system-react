import { screen } from '@testing-library/react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('SectionHeader', () => {
  it('renders an h2 title by default without description or action', () => {
    renderWithProviders(<SectionHeader title="Passenger details" />);

    const heading = screen.getByRole('heading', { level: 2, name: 'Passenger details' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('MuiTypography-h4');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses h3 typography styling for an h1 title with description and action', () => {
    renderWithProviders(
      <SectionHeader
        title="Flight details"
        component="h1"
        description="Review itinerary before booking."
        action={<button type="button">Select flight</button>}
      />,
    );

    const heading = screen.getByRole('heading', { level: 1, name: 'Flight details' });
    expect(heading).toHaveClass('MuiTypography-h3');
    expect(screen.getByText('Review itinerary before booking.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select flight' })).toBeInTheDocument();
  });

  it('maps h3 and h4 components to the h5 typography variant', () => {
    const { rerender } = renderWithProviders(
      <SectionHeader title="Filters" component="h3" />,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Filters' })).toHaveClass(
      'MuiTypography-h5',
    );

    rerender(
      <SectionHeader title="Sort options" component="h4" description={<span>Optional help</span>} />,
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Sort options' })).toHaveClass(
      'MuiTypography-h5',
    );
    expect(screen.getByText('Optional help')).toBeInTheDocument();
  });
});
