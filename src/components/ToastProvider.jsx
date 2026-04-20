import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
    if (timers.current[id]) clearTimeout(timers.current[id]);
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      timers.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: {
      bg: "linear-gradient(135deg, rgba(6,78,59,0.95), rgba(4,47,36,0.95))",
      border: "rgba(16,185,129,0.5)",
      icon: "#34d399",
      text: "white",
    },
    error: {
      bg: "linear-gradient(135deg, rgba(127,29,29,0.95), rgba(69,10,10,0.95))",
      border: "rgba(239,68,68,0.5)",
      icon: "#f87171",
      text: "white",
    },
    warning: {
      bg: "linear-gradient(135deg, rgba(120,53,15,0.95), rgba(69,26,3,0.95))",
      border: "rgba(245,158,11,0.5)",
      icon: "#fbbf24",
      text: "white",
    },
    info: {
      bg: "linear-gradient(135deg, rgba(8,51,68,0.95), rgba(7,35,48,0.95))",
      border: "rgba(6,182,212,0.5)",
      icon: "#22d3ee",
      text: "white",
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: 80,
          right: 24,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const Icon = icons[t.type];
          const s = styles[t.type];
          return (
            <div
              key={t.id}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 280,
                maxWidth: 400,
                backdropFilter: "blur(16px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                pointerEvents: "auto",
                animation: t.exiting
                  ? "toastSlideOut 0.35s ease forwards"
                  : "toastSlideIn 0.35s ease forwards",
              }}
            >
              <Icon size={18} color={s.icon} style={{ flexShrink: 0 }} />
              <p
                style={{
                  color: s.text,
                  fontSize: 13,
                  fontWeight: 500,
                  flex: 1,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                <X size={14} color="#94a3b8" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(40px) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
