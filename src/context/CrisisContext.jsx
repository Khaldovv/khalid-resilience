import { createContext, useContext, useState, useCallback, useEffect } from "react";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  CrisisContext — Global Crisis Mode Banner System
 * ═══════════════════════════════════════════════════════════════════════════════
 *  When a Catastrophic risk (inherent score ≥ 20) is logged, automatically
 *  activates a pulsing red "⚠️ CRISIS MODE ACTIVE" banner across ALL pages.
 *
 *  Features:
 *  - Auto-activates when addRisk() is called with catastrophic score
 *  - Manual activation/deactivation for Crisis Commanders
 *  - Persistent across page navigation (React Context)
 *  - Event log tracking for crisis timeline
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CrisisContext = createContext();

export function CrisisProvider({ children }) {
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisEvent, setCrisisEvent] = useState(null);
  const [crisisLog, setCrisisLog] = useState([]);

  const activateCrisis = useCallback((event) => {
    setCrisisMode(true);
    setCrisisEvent(event);
    setCrisisLog((prev) => [
      { time: new Date().toISOString(), action: "CRISIS_ACTIVATED", detail: event?.riskName || "Manual Activation" },
      ...prev,
    ]);
  }, []);

  const deactivateCrisis = useCallback(() => {
    setCrisisMode(false);
    setCrisisLog((prev) => [
      { time: new Date().toISOString(), action: "CRISIS_DEACTIVATED", detail: "All-Clear issued" },
      ...prev,
    ]);
  }, []);

  return (
    <CrisisContext.Provider value={{ crisisMode, crisisEvent, crisisLog, activateCrisis, deactivateCrisis }}>
      {children}
    </CrisisContext.Provider>
  );
}

export function useCrisis() {
  const ctx = useContext(CrisisContext);
  if (!ctx) throw new Error("useCrisis must be used within CrisisProvider");
  return ctx;
}

/**
 * CrisisBanner — Sticky pulsing red banner shown when Crisis Mode is active.
 * Render this at the top of your AppShell layout.
 */
export function CrisisBanner() {
  const { crisisMode, crisisEvent, deactivateCrisis } = useCrisis();
  const [isAr, setIsAr] = useState(false);

  useEffect(() => {
    setIsAr(document.documentElement.dir === "rtl");
    const obs = new MutationObserver(() => setIsAr(document.documentElement.dir === "rtl"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => obs.disconnect();
  }, []);

  if (!crisisMode) return null;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 99999,
      background: "linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)",
      borderBottom: "2px solid #ef4444",
      padding: "10px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      direction: isAr ? "rtl" : "ltr",
      animation: "crisisPulse 2s ease-in-out infinite",
      boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 20, animation: "crisisShake 0.5s ease-in-out infinite",
          display: "inline-block",
        }}>⚠️</span>
        <span style={{
          color: "#fecaca", fontSize: 14, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 2,
          textShadow: "0 0 10px rgba(239,68,68,0.8)",
        }}>
          {isAr ? "وضع الأزمة مفعّل" : "CRISIS MODE ACTIVE"}
        </span>
        {crisisEvent && (
          <span style={{
            color: "#fca5a5", fontSize: 12, fontWeight: 500,
            padding: "3px 10px", borderRadius: 6,
            background: "rgba(0,0,0,0.3)", border: "1px solid rgba(239,68,68,0.4)",
          }}>
            {crisisEvent.riskName || crisisEvent.detail || "Catastrophic Risk Declared"}
          </span>
        )}
      </div>

      <button onClick={deactivateCrisis} style={{
        padding: "6px 16px", borderRadius: 8,
        background: "rgba(0,0,0,0.4)", border: "1px solid rgba(239,68,68,0.6)",
        color: "#fca5a5", fontSize: 11, fontWeight: 700,
        cursor: "pointer", transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
        onMouseEnter={(e) => { e.target.style.background = "rgba(0,0,0,0.7)"; e.target.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.target.style.background = "rgba(0,0,0,0.4)"; e.target.style.color = "#fca5a5"; }}
      >
        {isAr ? "✕ إيقاف وضع الأزمة" : "✕ Stand Down — All Clear"}
      </button>

      <style>{`
        @keyframes crisisPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(239,68,68,0.4); }
          50% { box-shadow: 0 4px 40px rgba(239,68,68,0.8), inset 0 0 20px rgba(239,68,68,0.1); }
        }
        @keyframes crisisShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
}

export default CrisisContext;
