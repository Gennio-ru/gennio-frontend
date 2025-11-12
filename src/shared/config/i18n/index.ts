import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ruCommon from "./locales/ru/common.json";
import ruErrors from "./locales/ru/errors.json";
import enCommon from "./locales/en/common.json";
import enErrors from "./locales/en/errors.json";

void i18n.use(initReactI18next).init({
  lng: "ru",
  fallbackLng: "en",
  supportedLngs: ["ru", "en"],
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  ns: ["common", "errors"],
  defaultNS: "common",
  resources: {
    ru: {
      common: ruCommon,
      errors: ruErrors,
    },
    en: {
      common: enCommon,
      errors: enErrors,
    },
  },
});

export default i18n;
