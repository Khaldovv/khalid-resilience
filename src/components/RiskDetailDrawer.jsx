import { useEffect, useState, useMemo, Component } from "react";
import { X, AlertTriangle, Shield, TrendingUp, TrendingDown, Clock, Target, ChevronRight, Edit3, Save, XCircle, Lock, History, Layers, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useRisks } from "../context/RiskContext";
import { useToast } from "./ToastProvider";
import RiskSimulationView from "./risk/RiskSimulationView";
import RiskEditView from "./risk/RiskEditView";
import { scoreToSeverity } from "../utils/riskUtils";

// ─── Error Boundary for the drawer ──────────────────────────────────────────
class DrawerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[DrawerErrorBoundary] Caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          <p style={{ fontSize: 16, fontWeight: 700 }}>⚠️ Drawer Error</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{String(this.state.error?.message || this.state.error)}</p>
          <button onClick={this.props.onClose} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', cursor: 'pointer' }}>Close</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

// ─── Lifecycle status display names ──────────────────────────────────────────
const statusLabels = {
  'IDENTIFIED':     { ar: 'تم تحديد الخطر', en: 'Identified' },
  'Identified':     { ar: 'تم تحديد الخطر', en: 'Identified' },
  'PLANNED':        { ar: 'التخطيط', en: 'Planned' },
  'IN_PROGRESS':    { ar: 'قيد المعالجة', en: 'In Progress' },
  'UNDER_ANALYSIS': { ar: 'تحت التحليل', en: 'Under Analysis' },
  'MONITORED':      { ar: 'مراقبة نشطة', en: 'Monitored' },
  'ESCALATED':      { ar: 'تم التصعيد', en: 'Escalated' },
  'Escalated':      { ar: 'تم التصعيد', en: 'Escalated' },
  'CLOSED':         { ar: 'مغلق', en: 'Closed' },
};

function RiskDetailDrawerInner({ risk, onClose }) {
  const { language } = useApp();
  const { updateRisk } = useRisks();
  const toast = useToast();
  const isAr = language === "ar";

  // Safe render: ensures no object gets rendered as React child
  const safe = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      // Handle {en, ar} label objects
      if (val.en !== undefined || val.ar !== undefined) return val[language] || val.en || val.ar || '';
      return JSON.stringify(val);
    }
    return val;
  };
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [activeView, setActiveView] = useState("details"); // 'details' | 'edit' | 'simulation'
  const [auditTrail, setAuditTrail] = useState([]);
  const [localChanges, setLocalChanges] = useState([]); // Track changes made in this session

  useEffect(() => {
    if (risk) {
      requestAnimationFrame(() => setVisible(true));
      setActiveTab("details");
      setActiveView("details");
      setLocalChanges([]);
      // Fetch audit trail from backend
      const fetchAudit = async () => {
        try {
          const token = localStorage.getItem('grc_token');
          const riskId = risk.id || risk.riskId;
          const apiBase = import.meta.env.VITE_API_URL || '/api';
          const res = await fetch(`${apiBase}/v1/risks/${riskId}/audit-trail`, {
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
        // Create initial audit entry from risk creation date
        setAuditTrail([{
          id: 0, action: 'CREATE', field_changed: null,
          old_value: null, new_value: null,
          user_name: risk.owner || 'النظام',
          created_at: risk.date ? `${risk.date}T09:00:00` : new Date().toISOString(),
        }]);
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
    // Track changes for audit trail
    const now = new Date().toISOString();
    const newEntries = [];
    for (const [field, value] of Object.entries(changes)) {
      const oldVal = risk[field] || risk[field.replace(/_/g, '')] || '';
      if (String(oldVal) !== String(value)) {
        newEntries.push({
          id: Date.now() + Math.random(),
          action: 'UPDATE',
          field_changed: field,
          old_value: String(oldVal || ''),
          new_value: String(value),
          user_name: isAr ? 'أنت (جلسة حالية)' : 'You (current session)',
          created_at: now,
        });
      }
    }
    if (newEntries.length > 0) {
      setLocalChanges(prev => [...newEntries, ...prev]);
    }

    // Update risk in context
    if (updateRisk) {
      updateRisk(risk.id, changes);
    }
    setActiveView("details");
    toast.success(isAr ? `تم حفظ ${newEntries.length} تعديل بنجاح` : `${newEntries.length} changes saved`);
  };

  // ─── Combined audit = local session changes + server audit trail ──────────
  const combinedAudit = useMemo(() => [...localChanges, ...auditTrail], [localChanges, auditTrail]);

  // ─── Dynamic Timeline from audit trail + local changes ──────────────────────
  const timeline = useMemo(() => {
    if (!risk) return [];
    try {
      const entries = [];

      // Add initial creation from risk data
      const creationDate = risk?.date || risk?.created_at;
      if (creationDate) {
        const dateStr = String(creationDate);
        entries.push({
          time: formatRelativeTime(dateStr, isAr),
          event: isAr ? 'تم تحديد الخطر' : 'Risk identified',
          color: '#3b82f6',
          date: new Date(dateStr.includes('T') ? dateStr : `${dateStr}T09:00:00`),
        });
      }

      // Process audit entries
      for (const e of combinedAudit) {
        if (!e || !e.created_at) continue;
        const entryDate = new Date(e.created_at);

        if (e.field_changed === 'lifecycle_status') {
          const label = statusLabels[e.new_value];
          entries.push({
            time: formatRelativeTime(e.created_at, isAr),
            event: label ? (isAr ? label.ar : label.en) : (e.new_value || ''),
            color: e.new_value === 'CLOSED' ? '#10b981' : e.new_value === 'ESCALATED' ? '#ef4444' : e.new_value === 'MONITORED' ? '#06b6d4' : '#f59e0b',
            date: entryDate,
          });
        } else if (e.field_changed === 'residual_score' || e.field_changed === 'inherent_score') {
          entries.push({
            time: formatRelativeTime(e.created_at, isAr),
            event: isAr ? `تحديث الدرجة: ${e.old_value || '—'} → ${e.new_value || '—'}` : `Score: ${e.old_value || '—'} → ${e.new_value || '—'}`,
            color: '#f59e0b',
            date: entryDate,
          });
        } else if (e.field_changed === 'mitigation_plan') {
          entries.push({
            time: formatRelativeTime(e.created_at, isAr),
            event: isAr ? 'تحديث خطة التخفيف' : 'Mitigation plan updated',
            color: '#06b6d4',
            date: entryDate,
          });
        } else if (e.action === 'UPDATE' && e.field_changed) {
          const fieldLabel = fieldNameTranslations[e.field_changed];
          entries.push({
            time: formatRelativeTime(e.created_at, isAr),
            event: isAr ? `تعديل: ${fieldLabel?.ar || e.field_changed}` : `Updated: ${fieldLabel?.en || e.field_changed}`,
            color: '#8b5cf6',
            date: entryDate,
          });
        }
      }

      // Add current state
      const currentStatus = risk?.lifecycleStatus || risk?.lifecycle_status || risk?.status;
      const currentLabel = statusLabels[currentStatus];
      if (currentLabel) {
        entries.push({
          time: isAr ? 'الآن' : 'Now',
          event: isAr ? currentLabel.ar : currentLabel.en,
          color: '#10b981',
          date: new Date(),
        });
      }

      // Sort by date, remove duplicates
      entries.sort((a, b) => a.date - b.date);
      const seen = new Set();
      return entries.filter(e => {
        const key = `${e.event}-${e.time}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (err) {
      console.error('[Timeline] Error building timeline:', err);
      return [
        { time: isAr ? 'الآن' : 'Now', event: isAr ? 'مراقبة نشطة' : 'Active monitoring', color: '#10b981' },
      ];
    }
  }, [risk, combinedAudit, isAr]);

  // ─── Computed values (safe even when risk is null) ──────────────────────────
  const residualScore = risk ? (Number(risk.residualScore || risk.residual_score) || 0) : 0;
  const inherentScore = risk ? (Number(risk.inherentScore || risk.inherent_score || risk.score) || 0) : 0;
  const displayScore = residualScore > 0 ? residualScore : inherentScore;
  const isResidual = residualScore > 0;

  const sev = scoreToSeverity(displayScore);
  const sevLabel = String(sev.label[language] || sev.label.en || '');
  const scoreColor = displayScore >= 20 ? '#ef4444' : displayScore >= 15 ? '#f97316' : displayScore >= 10 ? '#eab308' : displayScore >= 5 ? '#22c55e' : '#94a3b8';

  const tabs = [
    { id: "details", label: isAr ? "التفاصيل" : "Details", icon: Layers },
    { id: "history", label: isAr ? `سجل التعديلات (${combinedAudit.length})` : `Edit History (${combinedAudit.length})`, icon: History },
  ];

  // ─── Details Grid items ───────────────────────────────────────────────────
  const detailItems = risk ? [
    { key: "category", label: isAr ? "الفئة" : "Category", value: safe(risk.category || risk.riskType || risk.risk_type || risk.cat) },
    { key: "owner", label: isAr ? "المالك" : "Owner", value: safe(risk.owner) },
    { key: "aiStatus", label: isAr ? "الإجراء الحالي" : "Current Action", value: safe(risk.aiStatus || risk.response_type) },
  ] : [];

  // ─── EARLY RETURN (after all hooks) ───────────────────────────────────────
  if (!risk) return null;

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
              {safe(risk.riskName || risk.risk_name || risk.name || risk.risk || '')}
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
              {/* Severity + Score — using residual score */}
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
                  <p style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace" }}>
                    {isAr ? "درجة الخطر" : "RISK SCORE"}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: scoreColor }}>
                      {displayScore}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {isResidual
                        ? (isAr ? `متبقي (كامن: ${inherentScore})` : `residual (inherent: ${inherentScore})`)
                        : (isAr ? "كامن" : "inherent")
                      }
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
                      {safe(item.value) || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Timeline */}
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

              {combinedAudit.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                  <History size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>{isAr ? "لا توجد تعديلات مسجلة" : "No changes recorded"}</p>
                </div>
              )}

              {combinedAudit.map((entry, i) => (
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
                    {i < combinedAudit.length - 1 && (
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

// ─── Helper: format relative time ────────────────────────────────────────────
function formatRelativeTime(dateStr, isAr) {
  if (!dateStr) return isAr ? 'الآن' : 'Now';
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T09:00:00`);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return isAr ? 'الآن' : 'Just now';
  if (diffMins < 60) return isAr ? `قبل ${diffMins} دقيقة` : `${diffMins}m ago`;
  if (diffHours < 24) return isAr ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
  if (diffDays < 7) return isAr ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  if (diffDays < 30) return isAr ? `قبل ${Math.floor(diffDays / 7)} أسبوع` : `${Math.floor(diffDays / 7)}w ago`;
  return isAr ? `قبل ${Math.floor(diffDays / 30)} شهر` : `${Math.floor(diffDays / 30)}mo ago`;
}

// ─── Default export with Error Boundary ─────────────────────────────────────
export default function RiskDetailDrawer(props) {
  return (
    <DrawerErrorBoundary onClose={props.onClose}>
      <RiskDetailDrawerInner {...props} />
    </DrawerErrorBoundary>
  );
}
