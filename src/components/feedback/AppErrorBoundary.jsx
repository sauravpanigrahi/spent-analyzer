import { Component } from "react";
import { notifyError } from "../../utils/notifications";

export class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("Application render failure:", error, errorInfo);
    }
    notifyError(
      "Something went wrong while displaying this page. Refresh to try again.",
      { toastId: "application-render-error", autoClose: false },
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 text-center dark:bg-neutral-950">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              This page couldn't be displayed
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Refresh the page to try again.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
