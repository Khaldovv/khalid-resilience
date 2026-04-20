import { Globe } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useApp();
  const isAr = language === "ar";

  return (
    <button
      onClick={toggleLanguage}
      className="group relative flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all duration-200"
      style={{ background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)" }}
      title={isAr ? "Switch to English" : "التبديل للعربية"}
    >
      <Globe size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
        {isAr ? "EN" : "عربي"}
      </span>
      <span
        className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-cyan-400"
        style={{ animation: "glowPulse 2s ease-in-out infinite" }}
      />
    </button>
  );
}
