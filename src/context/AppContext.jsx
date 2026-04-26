import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../data/translations";

const AppContext = createContext();

const STORAGE_KEY = "jahizia-settings";

const defaults = {
  language: "ar",   // 'en' | 'ar' — Arabic first
  theme: "dark",    // 'dark' | 'light'
  fontSize: "md",   // 'sm' | 'md' | 'lg'
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply direction + lang attribute + RTL class
  useEffect(() => {
    const dir = settings.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = settings.language;
    if (settings.language === "ar") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [settings.language]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  // Apply font-size
  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", settings.fontSize);
  }, [settings.fontSize]);

  const setLanguage = (lang) => setSettings((s) => ({ ...s, language: lang }));
  const toggleLanguage = () =>
    setSettings((s) => ({ ...s, language: s.language === "en" ? "ar" : "en" }));

  const setTheme = (theme) => setSettings((s) => ({ ...s, theme }));
  const toggleTheme = () =>
    setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));

  const setFontSize = (fontSize) => setSettings((s) => ({ ...s, fontSize }));

  // Translation function: t('key') or t({ ar: '...', en: '...' })
  const t = useCallback((key) => {
    if (!key) return '';
    // Accept {ar, en} objects directly
    if (typeof key === 'object' && key.ar !== undefined) {
      return key[settings.language] || key.en || '';
    }
    // Look up from translations dictionary
    const entry = translations[key];
    if (entry) return entry[settings.language] || entry.en || key;
    return key; // fallback to the key itself
  }, [settings.language]);

  // Check if current language is RTL
  const isRTL = settings.language === "ar";

  return (
    <AppContext.Provider
      value={{
        ...settings,
        setLanguage,
        toggleLanguage,
        setTheme,
        toggleTheme,
        setFontSize,
        t,
        isRTL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default AppContext;
