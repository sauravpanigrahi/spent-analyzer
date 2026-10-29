import { notifyWarning } from "./notifications";

let currentPreferences = { currency: "INR", language: "en-US", rate: 1 };

export const setPreferenceSnapshot = (preferences) => {
  currentPreferences = { ...currentPreferences, ...preferences };
};

export const getPreferenceSnapshot = () => {
  let saved = {};
  try {
    const activeUserId = sessionStorage.getItem(
      "spend_analyzer_active_user_id",
    );
    if (activeUserId) {
      saved = JSON.parse(
        localStorage.getItem(`spend_analyzer_profile_${activeUserId}`) || "{}",
      );
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Could not read saved currency preferences:", error.name);
    }
    notifyPreferenceWarning();
  }
  return {
    currency: currentPreferences.currency || saved.currency || "INR",
    language: currentPreferences.language || saved.language || "en-US",
    rate: currentPreferences.rate ?? saved.rate ?? null,
  };
};

let warningSent = false;
const notifyPreferenceWarning = () => {
  if (warningSent) return;
  warningSent = true;
  notifyWarning("Saved currency preferences could not be read.", {
    toastId: "currency-preferences-read-warning",
    dedupeForMs: 60000,
  });
};
