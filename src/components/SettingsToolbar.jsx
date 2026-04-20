import { useState, useRef, useEffect } from "react";
import { Settings, Globe, Moon, Sun, Type, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const fontLabels = { sm: "S", md: "M", lg: "L" };

export default function SettingsToolbar() {
  const { language, toggleLanguage, theme, toggleTheme, fontSize, setFontSize } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isLight = theme === "light";
  const isAr = language === "ar";

  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    cursor: "pointer",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.2s",
    color: isLight ? "#334155" : "#e2e8f0",
    background: isLight ? "rgba(241,245,249,0.8)" : "rgba(30,41,59,0.8)",
  };

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        bottom: 20,
        right: isAr ? "auto" : 20,
        left: isAr ? 20 : "auto",
        zIndex: 99990,
      }}
    >
      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: isAr ? "auto" : 0,
            left: isAr ? 0 : "auto",
            background: isLight
              ? "rgba(255,255,255,0.88)"
              : "rgba(10,22,40,0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${isLight ? "rgba(203,213,225,0.6)" : "rgba(51,65,85,0.6)"}`,
            borderRadius: 18,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 200,
            boxShadow: isLight
              ? "0 16px 48px rgba(0,0,0,0.12)"
              : "0 16px 48px rgba(0,0,0,0.5)",
            animation: "settingsSlideUp 0.25s ease forwards",
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: isLight ? "#64748b" : "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {isAr ? "إعدادات المنصة" : "Platform Settings"}
            </span>
            <button onClick={() => setOpen(false)} style={{ ...btnBase, padding: 4, background: "transparent" }}>
              <X size={14} />
            </button>
          </div>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            style={{ ...btnBase }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isLight ? "rgba(226,232,240,0.9)" : "rgba(51,65,85,0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isLight ? "rgba(241,245,249,0.8)" : "rgba(30,41,59,0.8)"; }}
          >
            <Globe size={14} />
            <span style={{ flex: 1, textAlign: isAr ? "right" : "left" }}>
              {isAr ? "English" : "العربية"}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              background: "#06b6d4",
              color: "#020817",
            }}>
              {isAr ? "EN" : "AR"}
            </span>
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            style={{ ...btnBase }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isLight ? "rgba(226,232,240,0.9)" : "rgba(51,65,85,0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isLight ? "rgba(241,245,249,0.8)" : "rgba(30,41,59,0.8)"; }}
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
            <span style={{ flex: 1, textAlign: isAr ? "right" : "left" }}>
              {isAr
                ? (isLight ? "الوضع الليلي" : "الوضع النهاري")
                : (isLight ? "Dark Mode" : "Light Mode")}
            </span>
          </button>

          {/* Font Size */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Type size={14} style={{ color: isLight ? "#64748b" : "#94a3b8", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", flex: 1, textAlign: isAr ? "right" : "left" }}>
              {isAr ? "حجم الخط" : "Font Size"}
            </span>
            <div style={{ display: "flex", gap: 3 }}>
              {["sm", "md", "lg"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  style={{
                    ...btnBase,
                    padding: "4px 10px",
                    fontSize: s === "sm" ? 10 : s === "md" ? 12 : 14,
                    background: fontSize === s
                      ? "#06b6d4"
                      : isLight ? "rgba(241,245,249,0.8)" : "rgba(30,41,59,0.8)",
                    color: fontSize === s ? "#020817" : isLight ? "#334155" : "#e2e8f0",
                    fontWeight: fontSize === s ? 800 : 500,
                  }}
                >
                  {fontLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: `1px solid ${isLight ? "rgba(203,213,225,0.6)" : "rgba(51,65,85,0.6)"}`,
          background: isLight
            ? "rgba(255,255,255,0.85)"
            : "rgba(10,22,40,0.88)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: isLight
            ? "0 8px 32px rgba(0,0,0,0.1)"
            : "0 8px 32px rgba(0,0,0,0.45)",
          transition: "all 0.25s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = open ? "rotate(90deg) scale(1.08)" : "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = open ? "rotate(90deg)" : "rotate(0deg)"; }}
      >
        <Settings size={20} color={isLight ? "#334155" : "#94a3b8"} />
      </button>

      <style>{`
        @keyframes settingsSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
