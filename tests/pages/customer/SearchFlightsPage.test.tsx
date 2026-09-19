import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFlightsPage } from '@/pages/customer/SearchFlightsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('SearchFlightsPage', () => {
  it('lets the user pick origin and destination airports', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app/flights" element={<SearchFlightsPage />} />
      </Routes>,
      { initialEntries: ['/app/flights'] },
    );

    expect(screen.getByRole('heading', { name: 'Search flights' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^From/i), 'KUL');
    await user.click(
      await screen.findByRole('option', { name: /KUL — Kuala Lumpur International Airport/i }),
    );

    await user.type(screen.getByLabelText(/^To/i), 'SIN');
    await user.click(
      await screen.findByRole('option', { name: /SIN — Singapore Changi Airport/i }),
    );

    await user.click(screen.getByRole('button', { name: 'Search flights' }));

    await waitFor(() => {
      expect(screen.getByText(/KUL — Kuala Lumpur International Airport/i)).toBeInTheDocument();
      expect(screen.getByText(/SIN — Singapore Changi Airport/i)).toBeInTheDocument();
    });
  });

  it('requires both airports before searching', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SearchFlightsPage />);

    await user.click(screen.getByRole('button', { name: 'Search flights' }));

    expect(await screen.findByText('Select a departure airport')).toBeInTheDocument();
    expect(screen.getByText('Select an arrival airport')).toBeInTheDocument();
  });
});
