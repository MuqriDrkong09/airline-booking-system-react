import { screen, waitFor } from '@testing-library/react';
import { AuthBootstrap, useAuthStore } from '@/features/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

describe('AuthBootstrap', () => {
  const originalBootstrap = useAuthStore.getState().bootstrap;

  beforeEach(() => {
    resetAuthStore();
    useAuthStore.setState({ bootstrap: originalBootstrap });
  });

  afterEach(() => {
    useAuthStore.setState({ bootstrap: originalBootstrap });
  });

  it('shows a full-page loader while bootstrapping', () => {
    useAuthStore.setState({
      isBootstrapping: true,
      bootstrap: jest.fn().mockResolvedValue(undefined),
    });

    renderWithProviders(
      <AuthBootstrap>
        <p>App ready</p>
      </AuthBootstrap>,
    );

    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument();
    expect(screen.queryByText('App ready')).not.toBeInTheDocument();
  });

  it('renders children once bootstrapping is complete', () => {
    useAuthStore.setState({
      isBootstrapping: false,
      bootstrap: jest.fn().mockResolvedValue(undefined),
    });

    renderWithProviders(
      <AuthBootstrap>
        <p>App ready</p>
      </AuthBootstrap>,
    );

    expect(screen.getByText('App ready')).toBeInTheDocument();
    expect(screen.queryByText(/restoring your session/i)).not.toBeInTheDocument();
  });

  it('calls bootstrap on mount', async () => {
    const bootstrap = jest.fn().mockResolvedValue(undefined);
    useAuthStore.setState({
      isBootstrapping: false,
      bootstrap,
    });

    renderWithProviders(
      <AuthBootstrap>
        <p>App ready</p>
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(bootstrap).toHaveBeenCalledTimes(1);
    });
  });
});
