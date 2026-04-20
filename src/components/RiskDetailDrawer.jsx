import { useEffect, useState, useMemo } from "react";
import { X, AlertTriangle, Shield, TrendingUp, TrendingDown, Clock, Target, ChevronRight, Edit3, Save, XCircle, Lock, History, Layers, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useRisks } from "../context/RiskContext";
import { useToast } from "./ToastProvider";
import RiskSimulationView from "./risk/RiskSimulationView";
import RiskEditView from "./risk/RiskEditView";
import { scoreToSeverity } from "../utils/riskUtils";

// ─── Field name translations for audit trail ─────────────────────────────────
const fieldNameTranslations = {
  'risk_name':            { ar: 'اسم الخطر', en: 'Risk Name' },
  'description':          { ar: 'الوصف', en: 'Description' },
  'risk_type':            { ar: 'نوع الخطر', en: 'Risk Type' },
  'department':           { ar: 'الإدارة', en: 'Department' },
  'inherent_likelihood':  { ar: 'احتمالية الخطر الكامن', en: 'Inherent Likelihood' },
  'inherent_impact':      { ar: 'أثر الخطر الكامن', en: 'Inherent Impact' },
  'inherent_score':       { ar: 'درجة الخطر الكامن', en: 'Inherent Score' },
  'residual_likelihood':  { ar: 'احتمالية الخطر المتبقي', en: 'Residual Likelihood' },
  'residual_impact':      { ar: 'أثر الخطر المتبقي', en: 'Residual Impact' },
  'residual_score':       { ar: 'درجة الخطر المتبقي', en: 'Residual Score' },
  'lifecycle_status':     { ar: 'حالة دورة الحياة', en: 'Lifecycle Status' },
  'response_type':        { ar: 'نوع الاستجابة', en: 'Response Type' },
  'mitigation_plan':      { ar: 'خطة التخفيف', en: 'Mitigation Plan' },
  'risk_owner':           { ar: 'مالك الخطر', en: 'Risk Owner' },
  'notes':                { ar: 'الملاحظات', en: 'Notes' },
  'confidence_level':     { ar: 'مستوى الثقة', en: 'Confidence Level' },
};

// ─── Mock Audit Trail ─────────────────────────────────────────────────────────
const mockAuditTrail = [
  {
    id: 1, action: 'UPDATE', field_changed: 'residual_score',
    old_value: '20', new_value: '15',
    user_name: 'م. خالد الغفيلي', created_at: '2026-04-03T14:30:00',
  },
  {
    id: 2, action: 'UPDATE', field_changed: 'mitigation_plan',
    old_value: '', new_value: 'تطبيق التحديثات الأمنية المعلقة وتفعيل نظام كشف التسلل المتقدم',
    user_name: 'م. سعد الحربي', created_at: '2026-04-01T10:15:00',
  },
  {
    id: 3, action: 'UPDATE', field_changed: 'lifecycle_status',
    old_value: 'Identified', new_value: 'In Progress',
    user_name: 'م. خالد الغفيلي', created_at: '2026-03-25T11:00:00',
  },
  {
    id: 4, action: 'CREATE', field_changed: null,
    old_value: null, new_value: null,
    user_name: 'م. خالد الغفيلي', created_at: '2026-03-20T09:00:00',
  },
];

export default function RiskDetailDrawer({ risk, onClose }) {
  const { language } = useApp();
  const { updateRisk } = useRisks();
  const toast = useToast();
  const isAr = language === "ar";
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [activeView, setActiveView] = useState("details"); // 'details' | 'edit' | 'simulation'
  const [auditTrail, setAuditTrail] = useState(mockAuditTrail);

  useEffect(() => {
    if (risk) {
      requestAnimationFrame(() => setVisible(true));
      setActiveTab("details");
      setActiveView("details");
      // Fetch audit trail from backend
      const fetchAudit = async () => {
        try {
          const token = localStorage.getItem('token');
          const riskId = risk.id || risk.riskId;
          const res = await fetch(`/api/v1/risks/${riskId}/audit-trail`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setAuditTrail(data);
              return;
            }
          }
        } catch { /* Backend not available */ }
        setAuditTrail(mockAuditTrail);
      };
      fetchAudit();
    }
  }, [risk]);

  const handleClose = () => {
    setVisible(false);
    setActiveView("details");
    setTimeout(onClose, 350);
  };

  const handleSaveEdit = (changes) => {
    // Update risk in context
    if (updateRisk) {
      updateRisk(risk.id, changes);
    }
    setActiveView("details");
  };

  if (!risk) return null;

  // Compute severity from score, not from a stored string
  const riskScore = risk.residualScore || risk.residual_score || risk.score || risk.inherentScore || risk.inherent_score || 0;
  const sev = scoreToSeverity(riskScore);
  const sevLabel = sev.label[language] || sev.label.en;

  const timeline = [
    { time: isAr ? "قبل 3 أيام" : "3 days ago", event: isAr ? "تم تحديد الخطر" : "Risk identified", color: "#3b82f6" },
    { time: isAr ? "قبل 2 يوم" : "2 days ago", event: isAr ? "تقييم أولي" : "Initial assessment", color: "#f59e0b" },
    { time: isAr ? "قبل يوم" : "1 day ago", event: isAr ? "إجراءات التخفيف" : "Mitigation actions assigned", color: "#06b6d4" },
    { time: isAr ? "الآن" : "Now", event: isAr ? "مراقبة نشطة" : "Active monitoring", color: "#10b981" },
  ];

  const tabs = [
    { id: "details", label: isAr ? "التفاصيل" : "Details", icon: Layers },
    { id: "history", label: isAr ? "سجل التعديلات" : "Edit History", icon: History },
  ];

  // ─── Details Grid items ───────────────────────────────────────────────────
  const detailItems = [
    { key: "category", label: isAr ? "الفئة" : "Category", value: risk.category || risk.cat },
    { key: "owner", label: isAr ? "المالك" : "Owner", value: risk.owner },
    { key: "aiStatus", label: isAr ? "الإجراء الحالي" : "Current Action", value: risk.aiStatus },
  ];

  // ─── Format audit trail date ─────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isAr) {
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFieldName = (field) => {
    const t = fieldNameTranslations[field];
    return t ? t[language] : field;
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(5,10,24,0.6)", backdropFilter: "blur(4px)",
          zIndex: 99995,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Drawer */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        style={{
          position: "fixed", top: 0, bottom: 0,
          [isAr ? "left" : "right"]: 0,
          width: 460, maxWidth: "90vw",
          background: "var(--bg-primary, #020817)",
          borderLeft: isAr ? "none" : "1px solid var(--border-primary, #1e293b)",
          borderRight: isAr ? "1px solid var(--border-primary, #1e293b)" : "none",
          zIndex: 99996,
          overflowY: "auto",
          transform: visible
            ? "translateX(0)"
            : `translateX(${isAr ? "-100%" : "100%"})`,
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-primary, #1e293b)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0,
          background: "var(--bg-primary, #020817)", zIndex: 2,
        }}>
          <div>
            <p style={{ fontSize: 10, color: "var(--text-dim, #64748b)", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {activeView === "simulation" ? (isAr ? "محاكاة الخطر" : "RISK SIMULATION")
               : activeView === "edit" ? (isAr ? "تعديل الخطر" : "EDIT RISK")
               : (isAr ? "تفاصيل الخطر" : "RISK DETAILS")}
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #e2e8f0)", marginTop: 4 }}>
              {risk.name || risk.risk}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border-primary, #1e293b)",
              background: "var(--bg-card, rgba(15,23,42,0.6))",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s",
            }}
          >
            <X size={14} color="var(--text-muted, #94a3b8)" />
          </button>
        </div>

        {/* Tabs — only show when in details view */}
        {activeView === "details" && (
          <div style={{
            display: "flex", gap: 0, borderBottom: "1px solid var(--border-primary, #1e293b)",
            padding: "0 24px", position: "sticky", top: 72,
            background: "var(--bg-primary, #020817)", zIndex: 2,
          }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px", fontSize: 12, fontWeight: 600,
                  color: activeTab === tab.id ? "#06b6d4" : "#64748b",
                  border: "none", background: "none", cursor: "pointer",
                  borderBottom: activeTab === tab.id ? "2px solid #06b6d4" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* ═══════ SIMULATION VIEW ═══════ */}
          {activeView === "simulation" && (
            <RiskSimulationView risk={{ ...risk, riskName: risk.riskName || risk.risk_name || risk.name || risk.risk, risk_name: risk.riskName || risk.risk_name || risk.name || risk.risk }} onBack={() => setActiveView("details")} />
          )}

          {/* ═══════ EDIT VIEW ═══════ */}
          {activeView === "edit" && (
            <RiskEditView risk={risk} onCancel={() => setActiveView("details")} onSave={handleSaveEdit} />
          )}

          {/* ═══════ DETAILS TAB ═══════ */}
          {activeView === "details" && activeTab === "details" && (
            <>
              {/* Severity + Score */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12,
                  background: sev.bg, border: `1px solid ${sev.border}`,
                }}>
                  <p style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace" }}>{isAr ? "الخطورة" : "SEVERITY"}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: sev.color, marginTop: 4 }}>{sevLabel}</p>
                </div>
                <div style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12,
                  background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                }}>
                  <p style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace" }}>{isAr ? "درجة الخطر" : "RISK SCORE"}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: risk.score >= 80 ? "#f87171" : risk.score >= 60 ? "#fbbf24" : "#34d399" }}>
                      {risk.score}
                    </span>
                    <span style={{ fontSize: 11, color: risk.delta > 0 ? "#f87171" : "#34d399" }}>
                      {risk.delta > 0 ? "+" : ""}{risk.delta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                borderRadius: 12,
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                overflow: "hidden",
              }}>
                {detailItems.map((item, i) => (
                  <div key={item.key} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: i < detailItems.length - 1 ? "1px solid var(--border-primary, #1e293b)" : "none",
                  }}>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div>
                <p style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>
                  {isAr ? "الجدول الزمني" : "TIMELINE"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {timeline.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, boxShadow: `0 0 8px ${t.color}40` }} />
                        {i < timeline.length - 1 && (
                          <div style={{ width: 1, height: 28, borderLeft: `1px dashed ${t.color}40`, marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 12 }}>
                        <p style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: t.color }}>{t.time}</p>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{t.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions — 4 buttons: Escalate | Simulate | Edit | Close */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: isAr ? "تصعيد" : "Escalate", icon: TrendingUp, bg: "rgba(127,29,29,0.3)", border: "#991b1b", color: "#f87171",
                    action: () => toast.warning(isAr ? 'تم تصعيد الخطر إلى مجلس الإدارة' : 'Risk escalated to the board for review') },
                  { label: isAr ? "محاكاة" : "Simulate", icon: Sparkles,
                    bg: "linear-gradient(135deg, rgba(147,51,234,0.25), rgba(126,34,206,0.15))",
                    border: "#7c3aed", color: "#c084fc",
                    action: () => setActiveView("simulation") },
                  { label: isAr ? "تعديل" : "Edit", icon: Edit3,
                    bg: "rgba(8,51,68,0.3)", border: "#155e75", color: "#22d3ee",
                    action: () => setActiveView("edit") },
                  { label: isAr ? "إغلاق" : "Close", icon: Shield, bg: "rgba(6,78,59,0.3)", border: "#065f46", color: "#34d399",
                    action: () => { handleClose(); toast.success(isAr ? 'تم إغلاق لوحة التفاصيل' : 'Detail panel closed'); } },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10,
                    border: `1px solid ${a.border}`, background: a.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 5, cursor: "pointer", fontSize: 11, fontWeight: 600,
                    color: a.color, transition: "all 0.2s",
                  }}>
                    <a.icon size={13} />
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ═══════ EDIT HISTORY TAB ═══════ */}
          {activeView === "details" && activeTab === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <p style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 16 }}>
                {isAr ? "سجل التعديلات" : "EDIT HISTORY"}
              </p>

              {auditTrail.map((entry, i) => (
                <div key={entry.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Timeline connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: entry.action === 'CREATE' ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.15)",
                      border: `1px solid ${entry.action === 'CREATE' ? "#10b981" : "#06b6d4"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {entry.action === 'CREATE'
                        ? <span style={{ fontSize: 12 }}>✨</span>
                        : <Edit3 size={11} style={{ color: "#06b6d4" }} />}
                    </div>
                    {i < auditTrail.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 20, background: "#1e293b", marginTop: 4, marginBottom: 4 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1,
                    padding: "12px 14px", borderRadius: 10,
                    background: "var(--bg-card, rgba(15,23,42,0.5))",
                    border: "1px solid var(--border-primary, #1e293b)",
                    marginBottom: 12,
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>
                        {entry.user_name}
                      </span>
                      <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                        {formatDate(entry.created_at)}
                      </span>
                    </div>

                    {entry.action === 'CREATE' ? (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 10px", borderRadius: 6,
                        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>
                          {isAr ? "تم إنشاء الخطر" : "Risk Created"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>
                            {isAr ? "تعديل الحقل:" : "Field:"}
                          </span>
                          {" "}
                          <span style={{ color: "#06b6d4", fontWeight: 700 }}>
                            {getFieldName(entry.field_changed)}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {/* Old value */}
                          <div style={{
                            flex: 1, minWidth: 100,
                            padding: "6px 10px", borderRadius: 6,
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                          }}>
                            <div style={{ fontSize: 9, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>
                              {isAr ? "القيمة السابقة" : "Previous"}
                            </div>
                            <div style={{
                              fontSize: 11, color: "#f87171", textDecoration: "line-through",
                              wordBreak: "break-word",
                            }}>
                              {entry.old_value || (isAr ? "(فارغ)" : "(empty)")}
                            </div>
                          </div>

                          {/* New value */}
                          <div style={{
                            flex: 1, minWidth: 100,
                            padding: "6px 10px", borderRadius: 6,
                            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                          }}>
                            <div style={{ fontSize: 9, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>
                              {isAr ? "القيمة الجديدة" : "New"}
                            </div>
                            <div style={{
                              fontSize: 11, color: "#10b981", fontWeight: 600,
                              wordBreak: "break-word",
                            }}>
                              {entry.new_value || (isAr ? "(فارغ)" : "(empty)")}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
