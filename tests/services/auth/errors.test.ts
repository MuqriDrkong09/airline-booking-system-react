import { AuthApiError, getErrorMessage, toAuthApiError } from '@/services/auth';
import axios from 'axios';

describe('auth errors', () => {
  it('returns AuthApiError messages directly', () => {
    const error = new AuthApiError('Invalid credentials.', { status: 401, code: 'INVALID' });
    expect(getErrorMessage(error)).toBe('Invalid credentials.');
  });

  it('extracts axios response messages', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { message: 'Email is already registered.', code: 'EMAIL_TAKEN' },
      },
    );

    expect(getErrorMessage(error)).toBe('Email is already registered.');
    const authError = toAuthApiError(error);
    expect(authError).toBeInstanceOf(AuthApiError);
    expect(authError.status).toBe(400);
    expect(authError.code).toBe('EMAIL_TAKEN');
  });

  it('falls back for unknown errors', () => {
    expect(getErrorMessage({}, 'Fallback message')).toBe('Fallback message');
  });
});
