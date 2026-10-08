import { screen } from '@testing-library/react';
import { SkipLink } from '@/components/layout/SkipLink';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('SkipLink', () => {
  it('targets main content and is keyboard focusable', () => {
    renderWithProviders(
      <>
        <SkipLink />
        <main id="main-content">Content</main>
      </>,
    );

    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#main-content');
    link.focus();
    expect(link).toHaveFocus();
  });
});
