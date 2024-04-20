// i18n.js
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import translations from "./translations.json";

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0].languageCode || "en";
i18n.enableFallback = true;

export default i18n;
