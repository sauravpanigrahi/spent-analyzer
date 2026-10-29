import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en-US/translation.json";
import es from "./locales/es-ES/translation.json";
import fr from "./locales/fr-FR/translation.json";
import de from "./locales/de-DE/translation.json";
import ja from "./locales/ja-JP/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: en },
    "es-ES": { translation: es },
    "fr-FR": { translation: fr },
    "de-DE": { translation: de },
    "ja-JP": { translation: ja },
  },
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: { escapeValue: false },
  returnNull: false,
  initImmediate: false,
});

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});

export default i18n;
