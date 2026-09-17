import type {
  AuthSession,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth';

export interface AuthApi {
  login: (payload: LoginRequest) => Promise<AuthSession>;
  register: (payload: RegisterRequest) => Promise<MessageResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<AuthUser>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<MessageResponse>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<MessageResponse>;
  verifyEmail: (payload: VerifyEmailRequest) => Promise<MessageResponse>;
}
