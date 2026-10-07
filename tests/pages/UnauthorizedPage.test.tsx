import { screen } from '@testing-library/react';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { HTTP_STATUS_MESSAGES } from '@/services/api';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('UnauthorizedPage', () => {
  it('shows a friendly 401 message and sign-in link', () => {
    renderWithProviders(<UnauthorizedPage />, {
      initialEntries: ['/unauthorized'],
    });

    expect(screen.getByRole('heading', { name: /401/i })).toBeInTheDocument();
    expect(screen.getByText(HTTP_STATUS_MESSAGES[401]!)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
