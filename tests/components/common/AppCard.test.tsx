import { screen } from '@testing-library/react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppCard', () => {
  it('renders children in the card content', () => {
    renderWithProviders(
      <AppCard>
        <p>Card body content</p>
      </AppCard>,
    );

    expect(screen.getByText('Card body content')).toBeInTheDocument();
    expect(document.querySelector('.MuiCardContent-root')).toBeInTheDocument();
  });

  it('defaults to an outlined card', () => {
    const { container } = renderWithProviders(<AppCard>Body</AppCard>);

    expect(container.querySelector('.MuiPaper-outlined')).toBeInTheDocument();
  });

  it('uses elevation when outlined is false', () => {
    const { container } = renderWithProviders(
      <AppCard outlined={false}>Elevated body</AppCard>,
    );

    expect(container.querySelector('.MuiPaper-outlined')).not.toBeInTheDocument();
    expect(container.querySelector('.MuiPaper-elevation')).toBeInTheDocument();
  });

  it('lets an explicit variant override the outlined prop', () => {
    const { container } = renderWithProviders(
      <AppCard outlined variant="elevation">
        Override body
      </AppCard>,
    );

    expect(container.querySelector('.MuiPaper-outlined')).not.toBeInTheDocument();
    expect(container.querySelector('.MuiPaper-elevation')).toBeInTheDocument();
  });

  it('renders a header when title, subtitle, or action is provided', () => {
    renderWithProviders(
      <AppCard
        title="Where are you flying?"
        subtitle="Plan your trip"
        action={<AppButton>Edit</AppButton>}
      >
        Form fields
      </AppCard>,
    );

    expect(document.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(screen.getByText('Where are you flying?')).toBeInTheDocument();
    expect(screen.getByText('Plan your trip')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders a header when only a subtitle is provided', () => {
    renderWithProviders(<AppCard subtitle="Filters">Body</AppCard>);

    expect(document.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders a header when only an action is provided', () => {
    renderWithProviders(
      <AppCard action={<AppButton>More</AppButton>}>Body</AppCard>,
    );

    expect(document.querySelector('.MuiCardHeader-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('omits the header when title, subtitle, and action are absent', () => {
    renderWithProviders(<AppCard>Just content</AppCard>);

    expect(document.querySelector('.MuiCardHeader-root')).not.toBeInTheDocument();
  });

  it('renders footer actions when provided', () => {
    renderWithProviders(
      <AppCard footer={<AppButton>Continue</AppButton>}>Body</AppCard>,
    );

    expect(document.querySelector('.MuiCardActions-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('omits footer actions when not provided', () => {
    renderWithProviders(<AppCard>Body only</AppCard>);

    expect(document.querySelector('.MuiCardActions-root')).not.toBeInTheDocument();
  });

  it('forwards additional Card props', () => {
    renderWithProviders(
      <AppCard id="flight-card" data-testid="app-card" aria-label="Flight summary">
        Props body
      </AppCard>,
    );

    const card = screen.getByTestId('app-card');
    expect(card).toHaveAttribute('id', 'flight-card');
    expect(card).toHaveAttribute('aria-label', 'Flight summary');
  });
});
