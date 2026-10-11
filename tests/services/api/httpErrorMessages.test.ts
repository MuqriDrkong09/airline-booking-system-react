import {
  DEFAULT_ERROR_MESSAGE,
  HTTP_STATUS_MESSAGES,
  HTTP_STATUS_TITLES,
  isTechnicalErrorMessage,
  messageForHttpStatus,
  titleForHttpStatus,
} from '@/services/api/httpErrorMessages';

describe('httpErrorMessages', () => {
  it('flags empty and technical transport messages', () => {
    expect(isTechnicalErrorMessage('')).toBe(true);
    expect(isTechnicalErrorMessage('Network Error')).toBe(true);
    expect(isTechnicalErrorMessage('timeout of 15000ms exceeded')).toBe(true);
    expect(isTechnicalErrorMessage('Request failed with status code 500')).toBe(true);
    expect(
      isTechnicalErrorMessage('Error: boom\n    at Object.<anonymous> (file.js:1:1)'),
    ).toBe(true);
    expect(isTechnicalErrorMessage('Email is already registered.')).toBe(false);
  });

  it('maps known statuses and falls back for other 5xx codes', () => {
    expect(messageForHttpStatus(403)).toBe(HTTP_STATUS_MESSAGES[403]);
    expect(messageForHttpStatus(511)).toBe(HTTP_STATUS_MESSAGES[500]);
    expect(messageForHttpStatus(418)).toBeUndefined();
    expect(messageForHttpStatus(undefined)).toBeUndefined();
  });

  it('maps titles for known statuses, unknown 5xx, and connection failures', () => {
    expect(titleForHttpStatus(401)).toBe(HTTP_STATUS_TITLES[401]);
    expect(titleForHttpStatus(599)).toBe(HTTP_STATUS_TITLES[500]);
    expect(titleForHttpStatus(undefined)).toBe('Connection problem');
    expect(titleForHttpStatus(418)).toBe('Something went wrong');
  });

  it('keeps the default user-facing fallback message stable', () => {
    expect(DEFAULT_ERROR_MESSAGE).toMatch(/try again/i);
  });
});
