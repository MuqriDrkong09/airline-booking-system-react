import { screen } from '@testing-library/react';
import { AuthPageShell, AuthTextLink } from '@/features/auth';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AuthPageShell', () => {
  it('renders the title, description, and children', () => {
    renderWithProviders(
      <AuthPageShell title="Sign in" description="Welcome back to AeroBook.">
        <button type="button">Continue</button>
      </AuthPageShell>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back to AeroBook.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('renders an optional footer when provided', () => {
    renderWithProviders(
      <AuthPageShell
        title="Create account"
        description="Join AeroBook to start booking."
        footer={<p>Already have an account?</p>}
      >
        <span>Form content</span>
      </AuthPageShell>,
    );

    expect(screen.getByText('Form content')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('accepts custom maxWidth and contentMaxWidth props', () => {
    const { container } = renderWithProviders(
      <AuthPageShell
        title="Reset password"
        description="Choose a new password."
        maxWidth="md"
        contentMaxWidth={560}
      >
        <span>Reset form</span>
      </AuthPageShell>,
    );

    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument();
    expect(screen.getByText('Reset form')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });
});

describe('AuthTextLink', () => {
  it('renders a router link to the given path', () => {
    renderWithProviders(
      <AuthTextLink to="/auth/register">Create an account</AuthTextLink>,
    );

    const link = screen.getByRole('link', { name: 'Create an account' });
    expect(link).toHaveAttribute('href', '/auth/register');
  });
});
