import { useEffect } from "react";
import { notifyError } from "../../utils/notifications";

export const GlobalErrorNotifications = () => {
  useEffect(() => {
    const handleError = () => {
      notifyError(
        "An unexpected error occurred. Please try again.",
        { toastId: "unhandled-application-error" },
      );
    };
    const handleRejection = () => {
      notifyError(
        "An unexpected request failed. Please try again.",
        { toastId: "unhandled-request-error" },
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
};
