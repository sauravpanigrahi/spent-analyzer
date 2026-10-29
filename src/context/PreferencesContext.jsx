import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  notifyError,
  notifyWarning,
} from "../utils/notifications";
import i18n from "../i18n";
import { setPreferenceSnapshot } from "../utils/preferences";
import {
  convertAmountFromBase,
  convertAmountToBase,
} from "../utils/currency";

const PreferencesContext = createContext(null);
const RATE_CACHE_KEY = "spend_analyzer_inr_exchange_rates";
const RATE_CACHE_MAX_AGE = 12 * 60 * 60 * 1000;
const DEFAULT_PREFERENCES = { currency: "INR", language: "en-US" };

const readRateCache = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || "null");
    if (
      cache &&
      Number.isFinite(cache.savedAt) &&
      cache.rates &&
      typeof cache.rates === "object"
    ) {
      return cache;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Could not read cached exchange rates:", error.name);
    }
    notifyWarning("Cached exchange rates could not be read.", {
      toastId: "exchange-rate-cache-read-warning",
      dedupeForMs: 60000,
    });
  }
  return null;
};

const fetchExchangeRates = async () => {
  const response = await fetch("https://open.er-api.com/v6/latest/INR", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Exchange-rate service returned ${response.status}.`);
  }
  const data = await response.json();
  console.log("Exchange API base:", data);
  console.log("INR → USD rate:", data.rates?.USD);
  console.log("₹413 → USD:", 413 * data.rates?.USD);
  if (data.result !== "success" || !data.rates || data.base_code !== "INR") {
    throw new Error("Exchange-rate service returned an invalid response.");
  }

  const rates = Object.fromEntries(
    Object.entries(data.rates)
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
      .map(([code, rate]) => [code, rate]),
  );
  rates.INR = 1;
  const cache = { rates, savedAt: Date.now() };
  try {
    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Could not cache exchange rates:", error.name);
    }
  }
  return cache;
};

export const PreferencesProvider = ({ children }) => {
  const { user, getProfile, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [exchangeRateData, setExchangeRateData] = useState(readRateCache);

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setPreferences(DEFAULT_PREFERENCES);
      return () => {
        active = false;
      };
    }

    try {
      const cached = JSON.parse(
        localStorage.getItem(`spend_analyzer_profile_${user.id}`) || "null",
      );
      if (cached && active) {
        setPreferences({
          currency: cached.currency || DEFAULT_PREFERENCES.currency,
          language: cached.language || DEFAULT_PREFERENCES.language,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Could not read saved preferences:", error.name);
      }
      notifyWarning("Saved preferences could not be read.", {
        toastId: "preferences-read-warning",
        dedupeForMs: 60000,
      });
    }

    getProfile().then((result) => {
      if (active && result.success && result.profile) {
        applyProfilePreferences(result.profile, user.id);
      }
    });

    const handleProfileUpdated = (event) => {
      if (active && event.detail) applyProfilePreferences(event.detail, user.id);
    };
    window.addEventListener(
      "spend-analyzer-profile-updated",
      handleProfileUpdated,
    );
    return () => {
      active = false;
      window.removeEventListener(
        "spend-analyzer-profile-updated",
        handleProfileUpdated,
      );
    };
  }, [getProfile, user?.id]);

  const applyProfilePreferences = (profileData, userId) => {
    const profile = {
      currency: profileData.currency || DEFAULT_PREFERENCES.currency,
      language: profileData.language || DEFAULT_PREFERENCES.language,
    };
    setPreferences(profile);
    try {
      localStorage.setItem(
        `spend_analyzer_profile_${userId}`,
        JSON.stringify({ ...profileData, ...profile }),
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Could not cache saved preferences:", error.name);
      }
      notifyWarning("Preferences were loaded but could not be cached.", {
        toastId: "preferences-cache-warning",
        dedupeForMs: 60000,
      });
    }
    if (profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language);
    }
  };

  useEffect(() => {
    if (preferences.currency === "INR") return undefined;

    let active = true;
    const cache = exchangeRateData;
    const isFresh =
      cache && Date.now() - cache.savedAt < RATE_CACHE_MAX_AGE;

    if (isFresh && cache.rates[preferences.currency]) {
      return undefined;
    }

    fetchExchangeRates()
      .then((result) => {
        if (active) setExchangeRateData(result);
      })
      .catch((error) => {
        if (!active) return;
        if (cache?.rates?.[preferences.currency]) {
          notifyWarning(
            "Live exchange rates are unavailable. Using the last cached rates.",
            { toastId: "exchange-rate-stale-warning", dedupeForMs: 60000 },
          );
          return;
        }
        notifyError(
          "Exchange rates could not be loaded. Values are shown without conversion.",
          { toastId: "exchange-rate-load-error", dedupeForMs: 60000 },
        );
        if (import.meta.env.DEV) {
          console.error("Exchange-rate request failed:", error.message);
        }
      });

    return () => {
      active = false;
    };
  }, [exchangeRateData, preferences.currency]);

  const setPreference = useCallback(
    async (key, value) => {
      const previousPreferences = preferences;
      setPreferences((current) => ({ ...current, [key]: value }));
      try {
        const profileKey = `spend_analyzer_profile_${user?.id}`;
        const cached = JSON.parse(localStorage.getItem(profileKey) || "{}");
        localStorage.setItem(
          profileKey,
          JSON.stringify({ ...cached, [key]: value }),
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Could not cache the updated preference:", error.name);
        }
        notifyWarning("The preference could not be cached on this device.", {
          toastId: "preference-cache-write-warning",
          dedupeForMs: 60000,
        });
      }
      if (key === "language") {
        await i18n.changeLanguage(value);
      }

      const result = await updateProfile({ [key]: value });
      if (!result.success) {
        setPreferences((current) =>
          current[key] === value
            ? { ...current, [key]: previousPreferences[key] }
            : current,
        );
        if (key === "language") {
          await i18n.changeLanguage(previousPreferences.language);
        }
        try {
          const profileKey = `spend_analyzer_profile_${user?.id}`;
          const cached = JSON.parse(localStorage.getItem(profileKey) || "{}");
          localStorage.setItem(
            profileKey,
            JSON.stringify({ ...cached, [key]: previousPreferences[key] }),
          );
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Could not restore the cached preference:", error.name);
          }
          notifyWarning("The previous preference could not be restored locally.", {
            toastId: "preference-cache-restore-warning",
            dedupeForMs: 60000,
          });
        }
        return result;
      }
      return result;
    },
    [preferences, updateProfile, user?.id],
  );

  const rate = useMemo(() => {
    if (preferences.currency === "INR") return 1;

    return exchangeRateData?.rates?.[preferences.currency] ?? null;
  }, [exchangeRateData, preferences.currency]);
useEffect(() => {
  console.log("Selected currency:", preferences.currency);
  console.log("Exchange rate:", rate);
  console.log(
    "₹413 converted:",
    rate == null ? "Rate not loaded" : (413 * rate).toFixed(2),
  );
}, [preferences.currency, rate]);
  useEffect(() => {
    setPreferenceSnapshot({ ...preferences, rate });
  }, [preferences, rate]);

  const convertToBase = useCallback(
    (amount) => convertAmountToBase(amount, rate),
    [rate],
  );
  const convertFromBase = useCallback(
    (amount) => convertAmountFromBase(amount, rate),
    [rate],
  );

  const value = useMemo(
    () => ({
      ...preferences,
      rate,
      convertToBase,
      convertFromBase,
      setPreference,
    }),
    [preferences, rate, convertToBase, convertFromBase, setPreference],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
