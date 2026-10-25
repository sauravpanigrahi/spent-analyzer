import React from "react";
import ReactDOM from "react-dom/client";
import { Bounce, ToastContainer } from "react-toastify";
import { notifyError } from "./utils/notifications";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const rootToast = (
  <ToastContainer
    position="top-right"
    autoClose={4500}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    limit={4}
    theme="light"
    role="alert"
    transition={Bounce}
    pauseOnFocusLoss
  />
);

const ConfigurationFallback = ({ startupFailure = false }) => {
  React.useEffect(() => {
    notifyError(
      startupFailure
        ? "The application could not start. Refresh the page or try again later."
        : "Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to connect the application.",
      { toastId: startupFailure ? "application-startup-error" : "missing-supabase-config" },
    );
  }, [startupFailure]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 text-center dark:bg-neutral-950">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {startupFailure ? "Application unavailable" : "Setup required"}
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {startupFailure
            ? "The application could not be loaded. Please refresh the page."
            : "The app needs its Supabase connection settings before it can load. Add the required Vite environment variables and restart or redeploy."}
        </p>
      </div>
    </main>
  );
};

const hasSupabaseConfiguration =
  Boolean(import.meta.env.VITE_SUPABASE_URL?.trim()) &&
  Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim());

if (!hasSupabaseConfiguration) {
  root.render(
    <React.StrictMode>
      {rootToast}
      <ConfigurationFallback />
    </React.StrictMode>,
  );
} else {
  import("./ApplicationRoot")
    .then(({ ApplicationRoot }) => {
      root.render(
        <React.StrictMode>
          {rootToast}
          <ApplicationRoot />
        </React.StrictMode>,
      );
    })
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error("Application startup failed:", error.name);
      }
      root.render(
        <React.StrictMode>
          {rootToast}
          <ConfigurationFallback startupFailure />
        </React.StrictMode>,
      );
    });
}
