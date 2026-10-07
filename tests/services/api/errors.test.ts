import axios from 'axios';
import {
  ApiError,
  AuthApiError,
  HTTP_STATUS_MESSAGES,
  NETWORK_ERROR_MESSAGE,
  getErrorMessage,
  getErrorTitle,
  toApiError,
  toAuthApiError,
} from '@/services/api';

function axiosError(status: number, data?: unknown, message = 'Request failed') {
  return new axios.AxiosError(message, 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: 'Error',
    headers: {},
    config: {} as never,
    data,
  });
}

describe('api errors', () => {
  it('keeps safe ApiError messages', () => {
    const error = new ApiError('Invalid credentials.', { status: 401, code: 'INVALID' });
    expect(getErrorMessage(error)).toBe('Invalid credentials.');
  });

  it('maps axios body messages into ApiError and AuthApiError', () => {
    const error = axiosError(400, { message: 'Invalid payload.', code: 'INVALID' });

    const apiError = toApiError(error);
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.message).toBe('Invalid payload.');
    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('INVALID');

    const authError = toAuthApiError(error);
    expect(authError).toBeInstanceOf(AuthApiError);
    expect(authError.message).toBe('Invalid payload.');
  });

  it('maps network, timeout, and HTTP statuses to friendly copy', () => {
    const network = new axios.AxiosError('Network Error', 'ERR_NETWORK');
    expect(getErrorMessage(network)).toBe(NETWORK_ERROR_MESSAGE);
    expect(getErrorTitle(network)).toBe('Connection problem');

    const timeout = new axios.AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED');
    expect(getErrorMessage(timeout)).toMatch(/took too long/i);

    expect(getErrorMessage(axiosError(401))).toBe(HTTP_STATUS_MESSAGES[401]);
    expect(getErrorMessage(axiosError(403))).toBe(HTTP_STATUS_MESSAGES[403]);
    expect(getErrorMessage(axiosError(404))).toBe(HTTP_STATUS_MESSAGES[404]);
    expect(getErrorMessage(axiosError(409))).toBe(HTTP_STATUS_MESSAGES[409]);
    expect(getErrorMessage(axiosError(422))).toBe(HTTP_STATUS_MESSAGES[422]);
    expect(getErrorMessage(axiosError(429))).toBe(HTTP_STATUS_MESSAGES[429]);
    expect(getErrorMessage(axiosError(500, undefined, 'Request failed with status code 500'))).toBe(
      HTTP_STATUS_MESSAGES[500],
    );
    expect(getErrorTitle(axiosError(403))).toBe('Access denied');
  });

  it('prefers the first field error for 422 responses', () => {
    const error = axiosError(422, {
      fieldErrors: { email: ['Email is already taken.'] },
    });
    expect(getErrorMessage(error)).toBe('Email is already taken.');
  });

  it('never returns stack-like technical messages', () => {
    const error = new Error('Error: boom\n    at Object.<anonymous> (file.js:1:1)');
    expect(getErrorMessage(error, 'Fallback')).toBe('Fallback');
  });

  it('falls back for unknown errors', () => {
    expect(getErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});
