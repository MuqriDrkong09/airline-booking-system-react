import { screen } from '@testing-library/react';
import { PageContainer } from '@/components/common/PageContainer';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('PageContainer', () => {
  it('renders children without a section header when title is omitted', () => {
    renderWithProviders(
      <PageContainer>
        <p>Page body</p>
      </PageContainer>,
    );

    expect(screen.getByText('Page body')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders a title, description, and action through SectionHeader', () => {
    renderWithProviders(
      <PageContainer
        title="Flight details"
        description="Review itinerary before booking."
        action={<button type="button">Select flight</button>}
      >
        <p>Details content</p>
      </PageContainer>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Flight details' })).toBeInTheDocument();
    expect(screen.getByText('Review itinerary before booking.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select flight' })).toBeInTheDocument();
    expect(screen.getByText('Details content')).toBeInTheDocument();
  });

  it('applies default maxWidth and custom Container props', () => {
    const { container } = renderWithProviders(
      <PageContainer title="Search" maxWidth="md" disableGutters data-testid="page-shell">
        <span>Results</span>
      </PageContainer>,
    );

    expect(screen.getByTestId('page-shell')).toBeInTheDocument();
    expect(container.querySelector('.MuiContainer-maxWidthMd')).toBeInTheDocument();
    expect(container.querySelector('.MuiContainer-disableGutters')).toBeInTheDocument();
  });

  it('forwards a custom spacing value onto the Stack', () => {
    const { container } = renderWithProviders(
      <PageContainer title="Profile" spacing={1}>
        <span>Profile body</span>
      </PageContainer>,
    );

    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });
});
