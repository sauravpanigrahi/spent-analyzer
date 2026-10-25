const RATE_LIMIT_CODES = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "over_sms_send_rate_limit",
  "over_email_verification_rate_limit",
  "over_email_rate_limit",
  "over_password_reset_rate_limit",
  "over_otp_send_rate_limit",
]);

export const getAuthErrorType = (error) => {
  const code = String(
    error?.code ||
      error?.context?.code ||
      error?.context?.body?.error_code ||
      error?.context?.body?.code ||
      "",
  ).toLowerCase();
  const message = String(
    error?.message ||
      error?.context?.error_description ||
      error?.context?.body?.message ||
      "",
  ).toLowerCase();
  const status = Number(
    error?.status ??
      error?.statusCode ??
      error?.context?.status ??
      error?.context?.response?.status ??
      error?.response?.status,
  );

  if (
    status === 429 ||
    code.includes("rate_limit") ||
    RATE_LIMIT_CODES.has(code) ||
    [...RATE_LIMIT_CODES].some((rateCode) => message.includes(rateCode)) ||
    message.includes("too many requests") ||
    message.includes("rate limit")
  ) {
    return "rate_limited";
  }

  if (
    code.includes("user_already_exists") ||
    code.includes("email_exists") ||
    message.includes("user already registered") ||
    message.includes("email already registered") ||
    message.includes("already been registered")
  ) {
    return "email_exists";
  }

  if (code.includes("weak_password") || message.includes("password should be")) {
    return "weak_password";
  }

  if (
    code.includes("invalid_email") ||
    message.includes("invalid email") ||
    message.includes("email address is invalid")
  ) {
    return "invalid_email";
  }

  if (
    code.includes("email_not_confirmed") ||
    message.includes("email not confirmed")
  ) {
    return "email_not_confirmed";
  }

  if (
    code.includes("otp_expired") ||
    code.includes("token_expired") ||
    code.includes("otp_disabled") ||
    message.includes("expired") ||
    message.includes("invalid or has expired")
  ) {
    return "recovery_expired";
  }

  if (
    error instanceof TypeError ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "network";
  }

  if (status >= 500) {
    return "server";
  }

  if (
    code.includes("invalid_credentials") ||
    message.includes("invalid login credentials")
  ) {
    return "invalid_credentials";
  }

  return "unexpected";
};

export const getAuthErrorMessage = (error, action = "auth") => {
  const errorType = getAuthErrorType(error);

  if (errorType === "rate_limited") {
    if (action === "login") {
      return "Too many sign-in attempts right now. Please wait a while before trying again.";
    }
    if (action === "password-update") {
      return "Too many password update requests right now. Please wait a while before trying again.";
    }
    return "Too many requests right now. We couldn't send your email. Please wait a while before trying again.";
  }
  if (errorType === "email_exists") {
    return "An account with this email already exists. Sign in or reset your password.";
  }
  if (errorType === "weak_password") {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (errorType === "invalid_email") {
    return "Enter a valid email address.";
  }
  if (errorType === "email_not_confirmed") {
    return "Please verify your email before signing in. You can request another verification email below.";
  }
  if (errorType === "network") {
    return "We couldn't connect. Check your internet connection and try again.";
  }
  if (errorType === "recovery_expired") {
    return "This link has expired or is no longer valid. Request a new password reset email.";
  }
  if (errorType === "invalid_credentials" && action === "login") {
    return "Email or password is incorrect. Check your details and try again.";
  }
  if (errorType === "server") {
    return "The service is temporarily unavailable. Please try again later.";
  }

  if (action === "login") {
    return "Email or password is incorrect. Check your details and try again.";
  }
  if (action === "signup") {
    return "We couldn't create your account right now. Please try again later.";
  }
  if (action === "resend") {
    return "We couldn't send a verification email. Please try again later.";
  }
  if (action === "reset-email") {
    return "We couldn't process that request right now. Please try again later.";
  }
  if (action === "password-update") {
    return "We couldn't update your password. Request a new reset link and try again.";
  }

  return "Something went wrong. Please try again.";
};

export const getAuthRedirectUrl = (path) => {
  if (typeof window === "undefined") {
    return `https://spent-analyzer-two.vercel.app${path}`;
  }

  const currentHost = window.location.hostname;
  const productionHosts = [
    "spent-analyzer-two.vercel.app",
    "spent-analyzer-green.vercel.app",
  ];
  const origin = productionHosts.includes(currentHost)
    ? "https://spent-analyzer-two.vercel.app"
    : window.location.origin;

  return new URL(path, origin).href;
};
