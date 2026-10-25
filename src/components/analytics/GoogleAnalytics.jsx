import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const CONSENT_KEY = "spent-analyzer-analytics-consent";
const CONSENT_EVENT = "spent-analyzer-analytics-consent";
const configuredMeasurementId = import.meta.env.GA_MEASUREMENT_ID?.trim();
const measurementId =
  configuredMeasurementId && /^G-[A-Z0-9]+$/i.test(configuredMeasurementId)
    ? configuredMeasurementId
    : null;

if (configuredMeasurementId && !measurementId) {
  console.error(
    "GA_MEASUREMENT_ID must be a valid Google Analytics 4 ID, for example G-XXXXXXXXXX.",
  );
}

const analyticsState = () => {
  if (!window.__spentAnalyzerAnalytics) {
    window.__spentAnalyzerAnalytics = {
      initializedIds: new Set(),
      lastPageViews: new Map(),
    };
  }
  return window.__spentAnalyzerAnalytics;
};

const initializeGoogleAnalytics = (id) => {
  const state = analyticsState();
  if (state.initializedIds.has(id)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  window.gtag("js", new Date());
  window.gtag("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  state.initializedIds.add(id);

  const scriptId = `google-analytics-${id}`;
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }
};

const savedConsent = () => {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch (error) {
    console.error("Could not read analytics consent preference:", error);
    return null;
  }
};

export const GoogleAnalytics = () => {
  const location = useLocation();
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(savedConsent());
    const handleConsentChange = (event) => {
      setConsent(event.detail);
    };
    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsentChange);
  }, []);

  useEffect(() => {
    if (!measurementId || consent !== "accepted") return;
    initializeGoogleAnalytics(measurementId);

    const state = analyticsState();
    const pagePath = location.pathname;
    if (state.lastPageViews.get(measurementId) === pagePath) return;
    state.lastPageViews.set(measurementId, pagePath);

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
    });
  }, [consent, location.pathname]);

  return null;
};

export const AnalyticsConsent = () => {
  const [consent, setConsent] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setConsent(savedConsent());
    setIsReady(true);
  }, []);

  if (!measurementId || !isReady) return null;

  const saveConsent = (value) => {
    try {
      if (value === null) {
        window.localStorage.removeItem(CONSENT_KEY);
      } else {
        window.localStorage.setItem(CONSENT_KEY, value);
      }
    } catch (error) {
      console.error("Could not save analytics consent preference:", error);
    }
    setConsent(value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
    const state = window.__spentAnalyzerAnalytics;
    if (value !== "accepted") {
      state?.lastPageViews.delete(measurementId);
    }
    if (window.gtag && value === "accepted") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    } else if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  };

  if (consent) {
    return (
      <button
        type="button"
        onClick={() => saveConsent(null)}
        className="fixed bottom-3 left-3 z-40 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-md hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Privacy settings
      </button>
    );
  }

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 sm:p-5"
      aria-label="Analytics privacy choices"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Allow Google Analytics to collect usage and page-view information to
          help improve Spend Analyzer? Analytics remains off until you accept.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveConsent("rejected")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => saveConsent("accepted")}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </aside>
  );
};
