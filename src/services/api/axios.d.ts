import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip attaching the bearer token. */
    skipAuth?: boolean;
    /** Disable automatic retry for this request. */
    skipRetry?: boolean;
    /** Internal retry counter used by the response interceptor. */
    __retryCount?: number;
  }
}
