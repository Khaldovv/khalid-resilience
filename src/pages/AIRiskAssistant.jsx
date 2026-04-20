import { useState } from "react";
import { useRisks } from "../context/RiskContext";
import { useApp } from "../context/AppContext";
import { aiAPI } from "../services/api";
import { useToast } from "../components/ToastProvider";
import {
  Sparkles, Send, User, Building2, ClipboardList, CheckCircle2,
  Loader2, Brain, ShieldAlert, AlertTriangle, Bot, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Department keys (match translations dept.* keys) ─────────────────────────
const departmentKeys = [
  "IT", "Finance", "Operations", "HR", "Legal", "Compliance", "Marketing", "Strategy", "Procurement",
];

// ─── Risk Level color helper ──────────────────────────────────────────────────
function riskColor(score) {
  if (score >= 20) return { bg: "rgba(127,29,29,0.25)", border: "#991b1b", text: "#fca5a5", labelAr: "كارثي", labelEn: "Catastrophic" };
  if (score >= 15) return { bg: "rgba(239,68,68,0.15)", border: "#dc2626", text: "#f87171", labelAr: "مرتفع", labelEn: "High" };
  if (score >= 10) return { bg: "rgba(249,115,22,0.15)", border: "#ea580c", text: "#fb923c", labelAr: "متوسط", labelEn: "Medium" };
  if (score >= 5)  return { bg: "rgba(234,179,8,0.15)", border: "#ca8a04", text: "#facc15", labelAr: "منخفض", labelEn: "Low" };
  return { bg: "rgba(34,197,94,0.15)", border: "#16a34a", text: "#4ade80", labelAr: "منخفض جداً", labelEn: "Very Low" };
}

// ─── Risk type badge colors ───────────────────────────────────────────────────
const riskTypeBadge = {
  Operational:   { bg: "rgba(6,182,212,0.12)", border: "#06b6d4", text: "#67e8f9" },
  Cybersecurity: { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#fca5a5" },
  Compliance:    { bg: "rgba(168,85,247,0.12)", border: "#a855f7", text: "#d8b4fe" },
  Financial:     { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#fde047" },
  Legal:         { bg: "rgba(59,130,246,0.12)", border: "#3b82f6", text: "#93c5fd" },
  Strategic:     { bg: "rgba(16,185,129,0.12)", border: "#10b981", text: "#6ee7b7" },
  Reputational:  { bg: "rgba(249,115,22,0.12)", border: "#f97316", text: "#fdba74" },
};

export default function AIRiskAssistant() {
  const toast = useToast();
  const { addAIRisks } = useRisks();
  const { t, isRTL, language } = useApp();

  // Form state
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [tasks, setTasks] = useState("");

  // AI state
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [expandedMitigation, setExpandedMitigation] = useState({});

  const hasSelection = suggestions.some((s) => s.selected);

  // ─── Generate risks ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!employeeName.trim() || !department || !tasks.trim()) {
      toast.error(t('aiRisk.fillAllFields'));
      return;
    }
    setLoading(true);
    setSubmitted(false);
    setExpandedMitigation({});
    try {
      const res = await aiAPI.generateRisks({
        employeeName: employeeName.trim(),
        department,
        dailyTasks: tasks.trim(),
        language,
      });
      const results = res.risks || [];
      setSuggestions(results);
      toast.success(`${t('aiRisk.analysisComplete')} — ${results.length} ${t('aiRisk.risksIdentified')}`);
    } catch {
      toast.error(t('aiRisk.analysisFailed'));
    } finally {
      setLoading(false);
    }
  };

  // ─── Toggle selection ───────────────────────────────────────────────────────
  const toggleSelect = (tempId) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, selected: !s.selected } : s))
    );
  };

  // ─── Toggle mitigation ─────────────────────────────────────────────────────
  const toggleMitigation = (tempId) => {
    setExpandedMitigation((prev) => ({ ...prev, [tempId]: !prev[tempId] }));
  };

  // ─── Submit selected risks ─────────────────────────────────────────────────
  const handleSubmit = () => {
    const selected = suggestions.filter((s) => s.selected);
    if (selected.length === 0) return;
    const added = addAIRisks(selected, department, employeeName);
    toast.success(`${added.length} ${t('aiRisk.submittedForReview')}`);
    setSubmitted(true);
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const dir = isRTL ? "rtl" : "ltr";
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    background: "rgba(15,23,42,0.9)", border: "1px solid #334155",
    color: "#e2e8f0", fontSize: 13, outline: "none", transition: "border-color 0.2s",
    direction: dir, textAlign: isRTL ? "right" : "left",
    fontFamily: isRTL ? "'IBM Plex Sans Arabic', 'Tajawal', system-ui, sans-serif" : "inherit",
  };
  const labelStyle = {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6,
    direction: dir, justifyContent: isRTL ? "flex-end" : "flex-start",
  };
  const focusH = (e) => (e.target.style.borderColor = "#06b6d4");
  const blurH = (e) => (e.target.style.borderColor = "#334155");

  return (
    <div style={{ padding: "24px 28px", minHeight: "100vh", background: "#020817", direction: dir }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(139,92,246,0.3)",
          }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <h1 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>{t('aiRisk.pageTitle')}</h1>
            <p style={{ color: "#64748b", fontSize: 11, margin: 0, fontFamily: "monospace", letterSpacing: isRTL ? 0 : 1 }}>
              {t('aiRisk.pageSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

        {/* ═══ LEFT PANEL: Input Form ═══ */}
        <div style={{
          flex: "1 1 340px", minWidth: 320,
          background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b",
          borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>
            <ClipboardList size={14} style={{ color: "#8b5cf6" }} />
            <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>{t('aiRisk.inputSection')}</span>
          </div>

          {/* Employee Name */}
          <div>
            <label style={labelStyle}><User size={11} /> {t('aiRisk.employeeName')}</label>
            <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)}
              placeholder={t('aiRisk.employeeNamePlaceholder')} style={inputStyle}
              onFocus={focusH} onBlur={blurH} />
          </div>

          {/* Department */}
          <div>
            <label style={labelStyle}><Building2 size={11} /> {t('aiRisk.department')}</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", color: department ? "#e2e8f0" : "#475569" }}
              onFocus={focusH} onBlur={blurH}>
              <option value="">{t('aiRisk.departmentPlaceholder')}</option>
              {departmentKeys.map((d) => (
                <option key={d} value={d}>{t(`dept.${d}`)}</option>
              ))}
            </select>
          </div>

          {/* Daily Tasks */}
          <div>
            <label style={labelStyle}><ClipboardList size={11} /> {t('aiRisk.dailyTasks')}</label>
            <textarea value={tasks} onChange={(e) => setTasks(e.target.value)}
              placeholder={t('aiRisk.dailyTasksPlaceholder')}
              rows={6}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              onFocus={focusH} onBlur={blurH} />
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={loading}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 12,
              background: loading ? "#334155" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
              border: "1px solid rgba(139,92,246,0.5)",
              color: loading ? "#94a3b8" : "white", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.3)",
              transition: "all 0.3s",
            }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? t('aiRisk.analyzing') : t('aiRisk.findRisksButton')}
          </button>

          {/* Hint */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
            borderRadius: 8, background: "rgba(139,92,246,0.06)", border: "1px solid #1e293b",
            fontSize: 11, color: "#64748b",
          }}>
            <Bot size={12} style={{ color: "#8b5cf6", flexShrink: 0 }} />
            <span>{t('aiRisk.findRisksHint')}</span>
          </div>
        </div>

        {/* ═══ RIGHT PANEL: AI Suggestions ═══ */}
        <div style={{
          flex: "1.5 1 460px", minWidth: 400,
          background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b",
          borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16,
          position: "relative",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={14} style={{ color: "#f59e0b" }} />
              <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>{t('aiRisk.suggestionsSection')}</span>
            </div>
            {suggestions.length > 0 && (
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                {suggestions.filter(s => s.selected).length} / {suggestions.length} {t('aiRisk.selected')}
              </span>
            )}
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 10,
              background: "rgba(2,8,23,0.85)", backdropFilter: "blur(8px)",
              borderRadius: 16, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))",
                border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Loader2 size={24} color="#8b5cf6" className="animate-spin" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 15, fontWeight: 700, margin: 0 }}>{t('aiRisk.loadingTitle')}</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: "6px 0 0" }}>{t('aiRisk.loadingDetail')}</p>
              </div>
              <div style={{
                width: 180, height: 4, borderRadius: 4, background: "#1e293b", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                  borderRadius: 4, animation: "progressBar 3s ease-in-out",
                  width: "100%",
                }} />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && suggestions.length === 0 && !submitted && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              padding: "40px 0",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: "rgba(30,41,59,0.6)", border: "1px solid #334155",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain size={28} style={{ color: "#475569" }} />
              </div>
              <p style={{ color: "#475569", fontSize: 13 }}>{t('aiRisk.noSuggestionsYet')}</p>
              <p style={{ color: "#334155", fontSize: 11, maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
                {t('aiRisk.noSuggestionsHint')}
              </p>
            </div>
          )}

          {/* Submitted State */}
          {submitted && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              padding: "40px 0",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle2 size={28} style={{ color: "#10b981" }} />
              </div>
              <p style={{ color: "#10b981", fontSize: 15, fontWeight: 700 }}>{t('aiRisk.successTitle')}</p>
              <p style={{ color: "#64748b", fontSize: 12, maxWidth: 340, textAlign: "center", lineHeight: 1.6 }}>
                {t('aiRisk.successDetail')} <strong style={{ color: "#3b82f6" }}>"{t('aiRisk.identified')}"</strong>.{" "}
                {t('aiRisk.awaitingApproval')}
              </p>
              <button onClick={() => { setSuggestions([]); setSubmitted(false); setTasks(""); }}
                style={{
                  marginTop: 8, padding: "8px 20px", borderRadius: 10,
                  background: "#1e293b", border: "1px solid #334155",
                  color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                {t('aiRisk.generateMore')}
              </button>
            </div>
          )}

          {/* Suggestions Table */}
          {!loading && suggestions.length > 0 && !submitted && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto", maxHeight: 700 }}>
                {suggestions.map((s) => {
                  const score = s.likelihood * s.impact;
                  const rc = riskColor(score);
                  const tb = riskTypeBadge[s.riskType] || riskTypeBadge.Operational;
                  const isMitExpanded = expandedMitigation[s.tempId];
                  return (
                    <div key={s.tempId}
                      style={{
                        padding: 16, borderRadius: 12, cursor: "pointer",
                        background: s.selected ? "rgba(139,92,246,0.08)" : "rgba(15,23,42,0.8)",
                        border: s.selected ? "1px solid rgba(139,92,246,0.4)" : "1px solid #1e293b",
                        transition: "all 0.2s",
                      }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }} onClick={() => toggleSelect(s.tempId)}>
                        {/* Checkbox */}
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          border: s.selected ? "2px solid #8b5cf6" : "2px solid #475569",
                          background: s.selected ? "rgba(139,92,246,0.2)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}>
                          {s.selected && <CheckCircle2 size={14} style={{ color: "#8b5cf6" }} />}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
                              {s.riskName}
                            </span>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              {/* Risk type badge */}
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                color: tb.text, background: tb.bg, border: `1px solid ${tb.border}`,
                                whiteSpace: "nowrap",
                              }}>
                                {s.riskType}
                              </span>
                              {/* Score badge */}
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                color: rc.text, background: rc.bg, border: `1px solid ${rc.border}`,
                                whiteSpace: "nowrap",
                              }}>
                                {score} · {isRTL ? rc.labelAr : rc.labelEn}
                              </span>
                            </div>
                          </div>
                          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                            {s.description}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, color: "#64748b" }}>
                              <AlertTriangle size={10} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 3 }} />
                              {t('aiRisk.likelihood')}: <strong style={{ color: "#e2e8f0" }}>{s.likelihood}</strong>/5
                            </span>
                            <span style={{ fontSize: 10, color: "#64748b" }}>
                              {t('aiRisk.impact')}: <strong style={{ color: "#e2e8f0" }}>{s.impact}</strong>/5
                            </span>
                            {s.confidence && (
                              <span style={{
                                fontSize: 9, color: "#8b5cf6", background: "rgba(139,92,246,0.1)",
                                padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(139,92,246,0.2)",
                              }}>
                                {t('aiRisk.confidence')}: {Math.round(s.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mitigation expandable */}
                      {s.mitigation && (
                        <div style={{ marginTop: 8, marginInlineStart: 34 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMitigation(s.tempId); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 4,
                              fontSize: 10, color: "#8b5cf6", background: "none",
                              border: "none", cursor: "pointer", padding: 0,
                            }}>
                            {isMitExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            {t('aiRisk.mitigationSuggestion')}
                          </button>
                          {isMitExpanded && (
                            <p style={{
                              fontSize: 11, color: "#cbd5e1", background: "rgba(0,0,0,0.2)",
                              padding: "8px 12px", borderRadius: 8, marginTop: 6, lineHeight: 1.6,
                            }}>
                              {s.mitigation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button onClick={handleSubmit} disabled={!hasSelection}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 12,
                  background: hasSelection ? "linear-gradient(135deg, #10b981, #059669)" : "#1e293b",
                  border: hasSelection ? "1px solid rgba(16,185,129,0.5)" : "1px solid #334155",
                  color: hasSelection ? "white" : "#475569",
                  fontSize: 14, fontWeight: 700, cursor: hasSelection ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: hasSelection ? "0 4px 20px rgba(16,185,129,0.25)" : "none",
                  transition: "all 0.3s",
                }}>
                <Send size={15} />
                {t('aiRisk.submitButton')}
                {hasSelection && (
                  <span style={{
                    fontSize: 10, background: "rgba(255,255,255,0.2)",
                    padding: "2px 8px", borderRadius: 4,
                  }}>
                    {suggestions.filter(s => s.selected).length} {t('aiRisk.risks')}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
