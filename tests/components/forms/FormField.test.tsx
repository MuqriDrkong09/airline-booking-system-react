import { screen } from '@testing-library/react';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('FormField', () => {
  it('associates the label and shows validation errors', () => {
    renderWithProviders(
      <FormField id="email" label="Email" errorMessage="Email is required">
        <AppInput />
      </FormField>,
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
});
