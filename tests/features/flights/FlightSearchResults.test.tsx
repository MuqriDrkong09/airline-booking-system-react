import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlightSearchResults } from '@/features/flights';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('FlightSearchResults', () => {
  it('shows loading then result cards for a valid search', async () => {
    renderWithProviders(
      <FlightSearchResults
        request={{
          from: 'KUL',
          to: 'NRT',
          departure: '2026-10-20',
          adults: 1,
          children: 0,
          infants: 0,
          cabinClass: 'ECONOMY',
        }}
      />,
    );

    expect(screen.getByText(/Searching flights/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Available flights/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Flight results/i)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: 'Select' }).length).toBeGreaterThan(0);
  }, 15000);

  it('shows an empty state for the ZZZ fixture', async () => {
    renderWithProviders(
      <FlightSearchResults
        request={{
          from: 'KUL',
          to: 'ZZZ',
          departure: '2026-10-20',
          adults: 1,
          children: 0,
          infants: 0,
          cabinClass: 'ECONOMY',
        }}
      />,
    );

    expect(await screen.findByText(/No flights found/i)).toBeInTheDocument();
  }, 15000);

  it('shows an error state for the ERR fixture', async () => {
    renderWithProviders(
      <FlightSearchResults
        request={{
          from: 'ERR',
          to: 'KUL',
          departure: '2026-10-20',
          adults: 1,
          children: 0,
          infants: 0,
          cabinClass: 'ECONOMY',
        }}
      />,
    );

    expect(await screen.findByText(/Flight search failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  }, 15000);

  it('allows sorting results', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FlightSearchResults
        request={{
          from: 'KUL',
          to: 'SIN',
          departure: '2026-10-20',
          adults: 1,
          children: 0,
          infants: 0,
          cabinClass: 'ECONOMY',
        }}
      />,
    );

    await screen.findByText(/Available flights/i);

    await user.click(screen.getByLabelText(/Sort by/i));
    await user.click(await screen.findByRole('option', { name: /Duration: shortest/i }));

    expect(screen.getByLabelText(/Sort by/i)).toHaveTextContent(/Duration: shortest/i);
  }, 15000);
});
