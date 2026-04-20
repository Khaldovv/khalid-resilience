import { useState, useEffect, useRef } from "react";
import { Bot, Send, Plus, Trash2, Search, ShieldAlert, BarChart3, FileSearch, CheckCircle, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useAI } from "../context/AIContext";
import { useApp } from "../context/AppContext";

const CONTEXT_TYPES = [
  { value: "GENERAL", label: { ar: "عام", en: "General" }, color: "#06b6d4" },
  { value: "RISK_ANALYSIS", label: { ar: "تحليل المخاطر", en: "Risk Analysis" }, color: "#ef4444" },
  { value: "BIA_REVIEW", label: { ar: "مراجعة BIA", en: "BIA Review" }, color: "#f59e0b" },
  { value: "SUMOOD_GAP", label: { ar: "تدقيق صمود", en: "Sumood Gap" }, color: "#10b981" },
  { value: "POLICY_CHECK", label: { ar: "فحص الامتثال", en: "Policy Check" }, color: "#8b5cf6" },
  { value: "INCIDENT_ADVISOR", label: { ar: "مستشار الحوادث", en: "Incident Advisor" }, color: "#f97316" },
];

const QUICK_ACTIONS = [
  { label: { ar: "فحص المخاطر", en: "Scan Risks" }, icon: ShieldAlert, action: "analyzeRisks", color: "#ef4444" },
  { label: { ar: "مراجعة BIA", en: "Review BIA" }, icon: FileSearch, action: "analyzeBIA", color: "#f59e0b" },
  { label: { ar: "تدقيق صمود", en: "Audit Sumood" }, icon: BarChart3, action: "analyzeSumood", color: "#10b981" },
  { label: { ar: "فحص الامتثال", en: "Check Compliance" }, icon: CheckCircle, action: "analyzeCompliance", color: "#8b5cf6" },
];

export default function AIAgentView() {
  const {
    conversations, activeConversation, messages, sending, loading,
    loadConversations, loadConversation, createConversation,
    sendMessage, archiveConversation,
  } = useAI();

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextType, setContextType] = useState("GENERAL");
  const messagesEndRef = useRef(null);
  const { language } = useApp();
  const isAr = language === "ar";
  const L = (en, ar) => isAr ? ar : en;

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    if (!activeConversation) {
      const conv = await createConversation(contextType, msg.slice(0, 80));
      if (conv) await sendMessage(conv.id, msg);
    } else {
      await sendMessage(activeConversation.id, msg);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvos = conversations.filter(c =>
    !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContextBadge = (type) => {
    const ct = CONTEXT_TYPES.find(c => c.value === type);
    if (!ct) return { label: type, color: "#64748b" };
    return { label: ct.label[language] || ct.label.en, color: ct.color };
  };

  // Simple markdown-like rendering
  const renderContent = (content) => {
    if (!content) return null;
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```\w*\n?/g, "").replace(/```$/, "");
        return (
          <pre key={i} style={{
            background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: 12, fontSize: 12, fontFamily: "monospace", overflowX: "auto",
            margin: "8px 0", color: "#e2e8f0",
          }}>{code}</pre>
        );
      }
      // Basic markdown: bold, headers, bullets
      const lines = part.split("\n");
      return lines.map((line, j) => {
        if (line.startsWith("### ")) return <h4 key={`${i}-${j}`} style={{ color: "#06b6d4", fontSize: 14, fontWeight: 700, margin: "12px 0 4px" }}>{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={`${i}-${j}`} style={{ color: "#06b6d4", fontSize: 15, fontWeight: 700, margin: "14px 0 6px" }}>{line.slice(3)}</h3>;
        if (line.startsWith("# ")) return <h2 key={`${i}-${j}`} style={{ color: "#06b6d4", fontSize: 16, fontWeight: 800, margin: "16px 0 8px" }}>{line.slice(2)}</h2>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <div key={`${i}-${j}`} style={{ paddingLeft: 16, position: "relative", margin: "2px 0" }}><span style={{ position: "absolute", left: 4, color: "#06b6d4" }}>•</span>{renderInline(line.slice(2))}</div>;
        if (line.match(/^\d+\.\s/)) return <div key={`${i}-${j}`} style={{ paddingLeft: 16, margin: "2px 0" }}>{renderInline(line)}</div>;
        if (line.trim() === "") return <div key={`${i}-${j}`} style={{ height: 8 }} />;
        return <div key={`${i}-${j}`} style={{ margin: "2px 0" }}>{renderInline(line)}</div>;
      });
    });
  };

  const renderInline = (text) => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={i} style={{ color: "#f1f5f9" }}>{p.slice(2, -2)}</strong>;
      }
      // Inline code: `text`
      const codeParts = p.split(/(`[^`]+`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${i}-${j}`} style={{ background: "#1e293b", padding: "1px 5px", borderRadius: 4, fontSize: 12, color: "#06b6d4" }}>{cp.slice(1, -1)}</code>;
        }
        return <span key={`${i}-${j}`}>{cp}</span>;
      });
    });
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", background: "var(--bg-base)", direction: isAr ? "rtl" : "ltr" }}>
      {/* ── LEFT PANEL: Conversation List ── */}
      <div style={{
        width: "30%", minWidth: 280, maxWidth: 380, borderInlineEnd: "1px solid var(--border-primary)",
        display: "flex", flexDirection: "column", background: "var(--bg-surface)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border-primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={16} color="white" />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>{L("AI Agent", "وكيل الذكاء الاصطناعي")}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 10, fontFamily: "monospace" }}>{L("RISK INTELLIGENCE", "ذكاء المخاطر")}</div>
            </div>
          </div>
          <button
            onClick={() => { createConversation(contextType); }}
            style={{
              width: "100%", padding: "10px 16px", borderRadius: 8,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              color: "white", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Plus size={14} /> {L("New Conversation", "محادثة جديدة")}
          </button>
          {/* Search */}
          <div style={{ position: "relative", marginTop: 10 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#475569" }} />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={L("Search conversations...", "بحث في المحادثات...")}
              style={{
                width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8,
                background: "var(--bg-card)", border: "1px solid var(--border-secondary)", color: "var(--text-primary)",
                fontSize: 12, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filteredConvos.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 24, fontSize: 13 }}>
              {L("No conversations yet. Start one!", "لا توجد محادثات بعد. ابدأ واحدة!")}
            </div>
          )}
          {filteredConvos.map(conv => {
            const badge = getContextBadge(conv.context_type);
            const isActive = activeConversation?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4,
                  background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isActive ? "white" : "#cbd5e1", fontSize: 13, fontWeight: 600,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {conv.title || L("New Conversation", "محادثة جديدة")}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 4,
                        background: `${badge.color}20`, color: badge.color, fontWeight: 600,
                      }}>{badge.label}</span>
                      <span style={{ fontSize: 10, color: "#475569" }}>
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); archiveConversation(conv.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#475569" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat Interface ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Chat Header */}
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--border-primary)",
          display: "flex", alignItems: "center", gap: 10, background: "var(--bg-base)",
        }}>
          <Sparkles size={16} style={{ color: "var(--accent-primary)" }} />
          <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>
            {activeConversation?.title || L("AI Risk Intelligence Agent", "وكيل ذكاء المخاطر")}
          </span>
          {activeConversation && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4, marginLeft: 8,
              background: `${getContextBadge(activeConversation.context_type).color}20`,
              color: getContextBadge(activeConversation.context_type).color, fontWeight: 600,
            }}>
              {getContextBadge(activeConversation.context_type).label}
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={28} color="white" />
              </div>
              <h3 style={{ color: "var(--text-primary)", fontSize: 18, marginBottom: 8 }}>{L("AI Risk Intelligence Agent", "وكيل ذكاء المخاطر")}</h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: 13, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                {L("I can analyze your risk register, review BIA processes, audit Sumood maturity scores, and check compliance drift. Ask me anything about your GRC data.",
                   "يمكنني تحليل سجل المخاطر، مراجعة عمليات BIA، تدقيق نضج صمود، وفحص انحراف الامتثال. اسألني أي شيء عن بيانات GRC.")}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 16,
            }}>
              <div style={{
                maxWidth: "75%", padding: "12px 16px", borderRadius: 12,
                background: msg.role === "user" ? "rgba(6,182,212,0.15)" : "var(--bg-card)",
                border: msg.role === "user" ? "1px solid rgba(6,182,212,0.3)" : "1px solid var(--border-secondary)",
                color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6,
              }}>
                {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
              <div style={{
                padding: "12px 20px", borderRadius: 12, background: "var(--bg-card)",
                border: "1px solid var(--border-secondary)", display: "flex", alignItems: "center", gap: 8,
              }}>
                <Loader2 size={14} style={{ color: "var(--accent-primary)", animation: "spin 1s linear infinite" }} />
                <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{L("Analyzing…", "جاري التحليل…")}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "8px 20px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_ACTIONS.map(qa => (
            <button
              key={qa.action}
              onClick={() => {
                const labelText = qa.label[language] || qa.label.en;
                const actionMsg = `Run a ${qa.label.en.toLowerCase()} analysis on the current platform data.`;
                if (!activeConversation) {
                  createConversation("RISK_ANALYSIS", labelText).then(conv => {
                    if (conv) sendMessage(conv.id, actionMsg);
                  });
                } else {
                  sendMessage(activeConversation.id, actionMsg);
                }
              }}
              style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: `${qa.color}15`, color: qa.color, border: `1px solid ${qa.color}30`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <qa.icon size={12} /> {qa.label[language] || qa.label.en}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: "12px 20px 16px", display: "flex", gap: 8, alignItems: "end" }}>
          <select
            value={contextType} onChange={e => setContextType(e.target.value)}
            style={{
              padding: "8px 10px", borderRadius: 8, background: "var(--bg-card)",
              border: "1px solid var(--border-secondary)", color: "var(--text-primary)", fontSize: 12,
              outline: "none", cursor: "pointer", minWidth: 120,
            }}
          >
            {CONTEXT_TYPES.map(ct => (
              <option key={ct.value} value={ct.value}>{ct.label[language] || ct.label.en}</option>
            ))}
          </select>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={L("Ask the AI Agent about your risk data...", "اسأل الوكيل عن بيانات مخاطرك...")}
              rows={1}
              style={{
                width: "100%", padding: "10px 44px 10px 14px", borderRadius: 10,
                background: "var(--bg-card)", border: "1px solid var(--border-secondary)", color: "var(--text-primary)",
                fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box",
                fontFamily: "inherit", lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend} disabled={sending || !input.trim()}
              style={{
                position: "absolute", right: 6, bottom: 6,
                width: 32, height: 32, borderRadius: 8,
                background: input.trim() ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "var(--border-secondary)",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
