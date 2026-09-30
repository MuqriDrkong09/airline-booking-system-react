import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlightStatusPage } from '@/pages/customer/FlightStatusPage';
import { renderWithProviders } from '../../utils/test-utils';

describe('FlightStatusPage', () => {
  it('looks up a flight and shows status details', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FlightStatusPage />, {
      initialEntries: ['/app/flight-status'],
    });

    expect(screen.getByRole('heading', { name: 'Flight status' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/flight number/i), 'MH123');
    await user.click(screen.getByRole('button', { name: /check status/i }));

    await waitFor(() => {
      expect(screen.getByText('Malaysia Airlines')).toBeInTheDocument();
    });

    expect(screen.getByText(/scheduled departure/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated departure/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduled arrival/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated arrival/i)).toBeInTheDocument();
    expect(screen.getByText(/^terminal$/i)).toBeInTheDocument();
    expect(screen.getByText(/^gate$/i)).toBeInTheDocument();
  });

  it('shows empty state for the ZZ000 fixture', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FlightStatusPage />, {
      initialEntries: ['/app/flight-status'],
    });

    await user.type(screen.getByLabelText(/flight number/i), 'ZZ000');
    await user.click(screen.getByRole('button', { name: /check status/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /no flight found/i })).toBeInTheDocument();
    });
  });
});
