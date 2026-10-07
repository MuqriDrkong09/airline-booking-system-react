import axios from 'axios';
import {
  ApiError,
  AuthApiError,
  getErrorMessage,
  toApiError,
  toAuthApiError,
} from '@/services/api';

describe('api errors', () => {
  it('returns ApiError messages directly', () => {
    const error = new ApiError('Boom', { status: 500, code: 'SERVER' });
    expect(getErrorMessage(error)).toBe('Boom');
  });

  it('maps axios errors into ApiError and AuthApiError', () => {
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
        data: { message: 'Invalid payload.', code: 'INVALID' },
      },
    );

    const apiError = toApiError(error);
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.message).toBe('Invalid payload.');
    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('INVALID');

    const authError = toAuthApiError(error);
    expect(authError).toBeInstanceOf(AuthApiError);
    expect(authError.message).toBe('Invalid payload.');
  });

  it('falls back for unknown errors', () => {
    expect(getErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});
