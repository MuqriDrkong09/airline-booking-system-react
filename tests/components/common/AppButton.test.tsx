import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppButton } from '@/components/common/AppButton';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppButton', () => {
  it('renders children and handles clicks', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    renderWithProviders(<AppButton onClick={onClick}>Continue</AppButton>);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state and disables interaction', () => {
    const onClick = jest.fn();

    renderWithProviders(
      <AppButton loading loadingLabel="Saving" onClick={onClick}>
        Save
      </AppButton>,
    );

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
