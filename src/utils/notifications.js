import { toast } from "react-toastify";

const recentNotifications = new Map();

const toastIdFor = (type, message) =>
  `${type}:${message.trim().toLowerCase().replace(/\s+/g, " ")}`;

const notify = (type, message, options = {}) => {
  if (typeof message !== "string" || !message.trim()) return null;

  const { dedupeForMs = 1500, ...toastOptions } = options;
  const toastId = toastOptions.toastId || toastIdFor(type, message);
  const now = Date.now();
  const lastNotifiedAt = recentNotifications.get(toastId);
  if (lastNotifiedAt && now - lastNotifiedAt < dedupeForMs) return toastId;
  if (toast.isActive(toastId)) return toastId;

  recentNotifications.set(toastId, now);
  return toast[type](message, {
    toastId,
    autoClose: 4500,
    ...toastOptions,
  });
};

export const notifyError = (message, options) =>
  notify("error", message, options);
export const notifySuccess = (message, options) =>
  notify("success", message, options);
export const notifyWarning = (message, options) =>
  notify("warning", message, options);
export const notifyInfo = (message, options) =>
  notify("info", message, options);

export const getSafeErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const status = Number(
    error?.status ??
      error?.statusCode ??
      error?.context?.status ??
      error?.context?.response?.status ??
      error?.response?.status,
  );
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

  if (
    status === 429 ||
    code.includes("rate_limit") ||
    message.includes("too many requests") ||
    message.includes("rate limit")
  ) {
    return "Too many requests right now. Please wait a while before trying again.";
  }
  if (code.includes("invalid_email") || message.includes("invalid email")) {
    return "Enter a valid email address.";
  }
  if (
    code.includes("weak_password") ||
    message.includes("password should be")
  ) {
    return "Choose a stronger password and try again.";
  }
  if (
    code.includes("user_already_exists") ||
    code.includes("email_exists")
  ) {
    return "An account with this email already exists.";
  }
  if (
    code.includes("email_not_confirmed") ||
    message.includes("email not confirmed")
  ) {
    return "Please verify your email before signing in.";
  }
  if (
    code.includes("otp_expired") ||
    code.includes("token_expired") ||
    message.includes("expired")
  ) {
    return "This link has expired. Request a new one to continue.";
  }
  if (code.includes("invalid_credentials")) {
    return "The current password is incorrect.";
  }
  if (status === 401) {
    return "Your session may have expired. Please sign in again.";
  }
  if (status === 403) {
    return "You don't have permission to complete this action.";
  }
  if (status === 404) {
    return "The requested information could not be found.";
  }
  if (status === 409) {
    return "This change conflicts with existing information. Refresh and try again.";
  }
  if (status >= 500) {
    return "The service is temporarily unavailable. Please try again later.";
  }
  if (
    status === 408 ||
    message.includes("timed out") ||
    message.includes("timeout")
  ) {
    return "The request took too long. Check your connection and try again.";
  }
  if (
    error instanceof TypeError ||
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return "We couldn't connect. Check your internet connection and try again.";
  }

  return fallback;
};
