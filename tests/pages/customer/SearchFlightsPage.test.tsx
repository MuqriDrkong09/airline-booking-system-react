import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFlightsPage } from '@/pages/customer/SearchFlightsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

async function pickAirport(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  query: string,
  optionName: RegExp,
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, query);
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('SearchFlightsPage', () => {
  it('searches a round-trip and shows criteria summary', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/flights" element={<SearchFlightsPage />} />
      </Routes>,
      { initialEntries: ['/app/flights'] },
    );

    expect(screen.getByRole('heading', { name: 'Search flights' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'One-way' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Round-trip' }));
    expect(screen.getByRole('button', { name: 'Round-trip' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText(/Return date/i)).toBeInTheDocument();

    await pickAirport(
      user,
      /^From/i,
      'KUL',
      /KUL — Kuala Lumpur International Airport/i,
    );
    await pickAirport(user, /^To/i, 'NRT', /NRT — Narita International Airport/i);

    await user.click(screen.getByRole('button', { name: 'Increase Adults' }));
    await user.click(screen.getByRole('button', { name: 'Search flights' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Round-trip · KUL/);
      expect(screen.getByRole('alert')).toHaveTextContent(/2 adults/);
      expect(screen.getByRole('alert')).toHaveTextContent(/NRT/);
    });
  }, 15000);

  it('requires airports before searching', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/flights" element={<SearchFlightsPage />} />
      </Routes>,
      { initialEntries: ['/app/flights'] },
    );

    await user.click(screen.getByRole('button', { name: 'Search flights' }));

    expect(await screen.findByText('Select a departure airport')).toBeInTheDocument();
    expect(screen.getByText('Select an arrival airport')).toBeInTheDocument();
  });

  it('hydrates the form from URL query parameters', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/app/flights" element={<SearchFlightsPage />} />
      </Routes>,
      {
        initialEntries: [
          '/app/flights?from=KUL&to=NRT&departure=2026-10-20&return=2026-10-27&adults=2&cabin=ECONOMY',
        ],
      },
    );

    expect(await screen.findByDisplayValue('2026-10-20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-10-27')).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/KUL — Kuala Lumpur/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/NRT — Tokyo/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/2 adults/);
      expect(screen.getByRole('alert')).toHaveTextContent(/KUL/);
    });
  }, 15000);

  it('supports switching to round-trip and multi-city from the one-way default', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/flights" element={<SearchFlightsPage />} />
      </Routes>,
      { initialEntries: ['/app/flights'] },
    );

    expect(screen.getByRole('button', { name: 'One-way' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByLabelText(/Return date/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Round-trip' }));
    expect(screen.getByLabelText(/Return date/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Multi-city' }));
    expect(screen.getByText('Flight 1')).toBeInTheDocument();
    expect(screen.getByText('Flight 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add flight' }));
    expect(screen.getByText('Flight 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove flight 3' }));
    expect(screen.queryByText('Flight 3')).not.toBeInTheDocument();
  });
});
