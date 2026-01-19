// Auth routes - SSOT for all authentication endpoints
export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CALLBACK: "/auth/callback",
  LOGOUT: "/api/auth/logout",
} as const;

// Auth error messages - SSOT for error handling
export const AUTH_ERRORS = {
  INVALID_EMAIL: "Invalid email address",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  SESSION_EXPIRED: "Your session has expired",
  VERIFICATION_FAILED: "Verification code is invalid or expired",
  VERIFICATION_SENT: "Check your email for verification code",
  RESET_LINK_SENT: "Password reset link sent to your email",
} as const;

// Auth messages - User-facing messages
export const AUTH_MESSAGES = {
  CHECK_EMAIL: "Check your email for verification link",
  VERIFY_EMAIL: "Please verify your email to continue",
  OTP_SENT: "6-digit code sent to your email",
  SIGNUP_SUCCESS: "Account created successfully. Check your email to verify.",
  PASSWORD_RESET_SUCCESS: "Password reset successfully. You can now log in.",
} as const;
