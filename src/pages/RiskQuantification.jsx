import { useState, useEffect } from "react";
import { Calculator, Play, Wallet, TrendingUp } from "lucide-react";
import { useQuantification } from "../context/QuantificationContext";
import { risksAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* ═══ Inject responsive CSS for Monte Carlo page ═══ */
const MC_STYLE_ID = "mc-responsive-css";
if (typeof document !== "undefined" && !document.getElementById(MC_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = MC_STYLE_ID;
  style.textContent = `
    .mc-main-grid {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 20px;
    }
    .mc-kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .mc-stats-row {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
    }
    .mc-portfolio-kpi {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    @media (max-width: 900px) {
      .mc-main-grid {
        grid-template-columns: 1fr !important;
      }
      .mc-kpi-grid {
        grid-template-columns: 1fr 1fr 1fr !important;
        gap: 8px !important;
      }
      .mc-kpi-grid .stat-card {
        padding: 10px 8px !important;
        min-width: 0 !important;
      }
      .mc-kpi-grid .stat-card div:first-child {
        font-size: 8px !important;
      }
      .mc-kpi-grid .stat-card div:last-child {
        font-size: 16px !important;
      }
      .mc-stats-row {
        gap: 10px !important;
        font-size: 10px !important;
      }
      .mc-portfolio-kpi {
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
    }
    @media (max-width: 500px) {
      .mc-kpi-grid {
        grid-template-columns: 1fr 1fr 1fr !important;
        gap: 6px !important;
      }
      .mc-kpi-grid .stat-card div:first-child {
        font-size: 7px !important;
        letter-spacing: 0 !important;
      }
      .mc-kpi-grid .stat-card div:last-child {
        font-size: 14px !important;
      }
      .mc-stats-row {
        gap: 6px !important;
        font-size: 9px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

const formatSAR = (val) => {
  const n = Number(val);
  if (isNaN(n)) return "—";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M SAR`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K SAR`;
  return `${n.toFixed(0)} SAR`;
};

export default function RiskQuantification() {
  const { quantifiedRisks, portfolio, simulationResult, loading, loadQuantified, runSimulation, loadPortfolio, runPortfolio, setSimulationResult } = useQuantification();
  const [risks, setRisks] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [tab, setTab] = useState("individual");
  const [simForm, setSimForm] = useState({ min_impact_sar: "", most_likely_impact_sar: "", max_impact_sar: "", probability_pct: "" });
  const year = new Date().getFullYear();

  useEffect(() => { loadQuantified(); loadPortfolio(year); }, []);
  useEffect(() => { risksAPI.list().then(res => setRisks(res.data || [])).catch(() => {}); }, []);

  const handleSimulate = async () => {
    if (!selectedRisk) return;
    await runSimulation(selectedRisk, simForm);
  };

  const tabs = [
    { id: "individual", label: "Individual Risk" },
    { id: "portfolio", label: "Portfolio View" },
    { id: "table", label: "All Quantified" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Calculator size={22} style={{ color: "#8b5cf6" }} />
        <h1 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, margin: 0 }}>Risk Quantification</h1>
        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#8b5cf620", color: "#8b5cf6", fontWeight: 600, fontFamily: "monospace" }}>MONTE CARLO</span>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-card)", borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "rgba(139,92,246,0.15)" : "transparent",
            color: tab === t.id ? "#8b5cf6" : "var(--text-tertiary)", border: "none", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Individual Risk Simulation */}
      {tab === "individual" && (
        <div className="mc-main-grid">
          {/* Input Form */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Simulation Parameters</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Select Risk</label>
              <select value={selectedRisk || ""} onChange={e => setSelectedRisk(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }}>
                <option value="">-- Select --</option>
                {risks.map(r => <option key={r.id} value={r.id}>{r.id}: {r.risk_name}</option>)}
              </select>
            </div>
            {[
              { key: "min_impact_sar", label: "Best Case (SAR)", placeholder: "min" },
              { key: "most_likely_impact_sar", label: "Most Likely (SAR)", placeholder: "mode" },
              { key: "max_impact_sar", label: "Worst Case (SAR)", placeholder: "max" },
              { key: "probability_pct", label: "Probability (%)", placeholder: "0-100" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type="number" value={simForm[f.key]} onChange={e => setSimForm({ ...simForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={handleSimulate} disabled={loading || !selectedRisk} style={{
              width: "100%", padding: "10px", borderRadius: 8, marginTop: 8,
              background: loading ? "var(--border-secondary)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "white", fontWeight: 700, fontSize: 14, border: "none",
              cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Play size={14} /> {loading ? "Running..." : "Run 10,000 Simulations"}
            </button>
          </div>

          {/* Results */}
          <div>
            {simulationResult ? (
              <>
                {/* KPI Cards */}
                <div className="mc-kpi-grid" style={{ marginBottom: 16 }}>
                  {[
                    { label: "ALE (Annual Loss Expectancy)", value: formatSAR(simulationResult.annualized_loss_expectancy_sar), color: "#ef4444" },
                    { label: "VaR 95%", value: formatSAR(simulationResult.var_95_sar), color: "#f59e0b" },
                    { label: "99th Percentile", value: formatSAR(simulationResult.percentile_99_sar), color: "#8b5cf6" },
                  ].map((c, i) => (
                    <div key={i} className="stat-card">
                      <div style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{c.label}</div>
                      <div style={{ color: c.color, fontSize: 22, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
                    </div>
                  ))}
                </div>
                {/* Histogram */}
                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Loss Distribution (10,000 simulations)</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={(() => { try { return JSON.parse(simulationResult.simulation_data); } catch { return simulationResult.simulation_data || []; } })()}>
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#64748b" }} angle={-20} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mc-stats-row">
                    <span>P95: {formatSAR(simulationResult.percentile_95_sar)}</span>
                    <span>P90: {formatSAR(simulationResult.percentile_90_sar)}</span>
                    <span>Median: {formatSAR(simulationResult.median_loss_sar)}</span>
                    <span>Mean: {formatSAR(simulationResult.mean_loss_sar)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card" style={{ padding: 40, textAlign: "center", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <Calculator size={32} style={{ color: "var(--border-secondary)", marginBottom: 12 }} />
                <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Select a risk and enter impact parameters, then run a simulation to see results</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio View */}
      {tab === "portfolio" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700, margin: 0 }}>Enterprise Portfolio ({year})</h3>
            <button onClick={() => runPortfolio(year)} disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, background: loading ? "var(--border-secondary)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "white", fontWeight: 600, fontSize: 12, border: "none", cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Running..." : "Run Portfolio Simulation"}
            </button>
          </div>
          {portfolio ? (
            <>
              <div className="mc-portfolio-kpi" style={{ marginBottom: 20 }}>
                {[
                  { label: "Total ALE", value: formatSAR(portfolio.total_ale_sar), color: "#ef4444" },
                  { label: "Portfolio VaR 95%", value: formatSAR(portfolio.portfolio_var_95_sar), color: "#f59e0b" },
                  { label: "Portfolio VaR 99%", value: formatSAR(portfolio.portfolio_var_99_sar), color: "#8b5cf6" },
                  { label: "Risks Quantified", value: portfolio.risk_count, color: "#06b6d4" },
                ].map((c, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{c.label}</div>
                    <div style={{ color: c.color, fontSize: 24, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Portfolio Loss Distribution</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(() => { try { return JSON.parse(portfolio.simulation_data); } catch { return portfolio.simulation_data || []; } })()}>
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#64748b" }} angle={-20} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
              <span style={{ color: "var(--text-tertiary)" }}>{quantifiedRisks.length === 0 ? "No risks quantified yet. Run individual simulations first." : "Run portfolio simulation to see aggregate risk exposure."}</span>
            </div>
          )}
        </div>
      )}

      {/* All Quantified Table */}
      {tab === "table" && (
        <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Risk ID", "Risk Name", "ALE", "VaR 95%", "P99", "Probability", "Last Run"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quantifiedRisks.map(q => (
                <tr key={q.id} onClick={() => { setSelectedRisk(q.risk_id); setSimulationResult(q); setTab("individual"); }} style={{ borderBottom: "1px solid #0f172a", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#0f172a"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#06b6d4", fontFamily: "monospace" }}>{q.risk_id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{q.risk_name || q.risk_id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{formatSAR(q.annualized_loss_expectancy_sar)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{formatSAR(q.var_95_sar)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#8b5cf6", fontWeight: 700 }}>{formatSAR(q.percentile_99_sar)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>{q.probability_pct}%</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#475569" }}>{new Date(q.calculated_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {quantifiedRisks.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#475569", fontSize: 13 }}>No risks quantified yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
