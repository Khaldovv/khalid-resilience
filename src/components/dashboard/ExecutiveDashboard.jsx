import { useState, useEffect } from 'react';
import { mockDashboardData } from '../../data/mockDashboard';
import DashboardKPIRow from './DashboardKPIRow';
import RiskTrendChart from './RiskTrendChart';
import RiskHeatmapMini from './RiskHeatmapMini';
import AIInsightsPanel from './AIInsightsPanel';
import ComplianceDistributionPanel from './ComplianceDistributionPanel';
import OperationalResiliencePanel from './OperationalResiliencePanel';
import IncidentCommandPanel from './IncidentCommandPanel';
import RiskLifecycleFunnel from './RiskLifecycleFunnel';
import RegulatoryCalendarPanel from './RegulatoryCalendarPanel';

// Staggered row animation delays
const ROW_DELAYS = [0, 100, 200, 300, 400];

export default function ExecutiveDashboard({ lang = 'ar', onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Try API first, fall back to mock
      try {
        const res = await fetch('/api/v1/dashboard/summary');
        if (res.ok) { setData(await res.json()); setLoading(false); return; }
      } catch (e) { /* fallback to mock */ }
      // Use mock data
      await new Promise(r => setTimeout(r, 600)); // Simulate load
      setData(mockDashboardData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const isRtl = lang === 'ar';

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-800 p-6"
            style={{ background: 'rgba(15,23,42,0.5)', height: i === 0 ? 120 : 240 }}>
            <div className="h-3 bg-slate-800 rounded w-1/4 mb-3" />
            <div className="h-2 bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 text-sm mb-3">{isRtl ? 'حدث خطأ في تحميل البيانات' : 'Error loading dashboard data'}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-500 transition-all">
          {isRtl ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* ═══ ROW 1: 6 KPI Cards ═══ */}
      <div style={{ animation: `fadeIn 0.5s ease ${ROW_DELAYS[0]}ms both` }}>
        <DashboardKPIRow data={data} lang={lang} onNavigate={onNavigate} />
      </div>

      {/* ═══ ROW 2: Risk Trend + Mini Heatmap ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4"
        style={{ animation: `fadeIn 0.5s ease ${ROW_DELAYS[1]}ms both` }}>
        <div className="xl:col-span-3">
          <RiskTrendChart data={data.riskTrend?.[lang] || data.riskTrend?.en || []} lang={lang} />
        </div>
        <div className="xl:col-span-2">
          <RiskHeatmapMini matrix={data.riskMatrix} lang={lang} onNavigate={onNavigate} />
        </div>
      </div>

      {/* ═══ ROW 3: AI Insights + Compliance Distribution ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        style={{ animation: `fadeIn 0.5s ease ${ROW_DELAYS[2]}ms both` }}>
        <AIInsightsPanel insights={data.aiInsights} lang={lang} onNavigate={onNavigate} />
        <ComplianceDistributionPanel frameworks={data.complianceFrameworks} lang={lang} />
      </div>

      {/* ═══ ROW 4: Operational Resilience + Incident Command ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        style={{ animation: `fadeIn 0.5s ease ${ROW_DELAYS[3]}ms both` }}>
        <OperationalResiliencePanel data={data.operationalResilience} lang={lang} />
        <IncidentCommandPanel data={data.incidentCommand} lang={lang} onNavigate={onNavigate} />
      </div>

      {/* ═══ ROW 5: Risk Funnel + Regulatory Calendar ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4"
        style={{ animation: `fadeIn 0.5s ease ${ROW_DELAYS[4]}ms both` }}>
        <div className="xl:col-span-3">
          <RiskLifecycleFunnel stages={data.riskLifecycleFunnel} lang={lang} />
        </div>
        <div className="xl:col-span-2">
          <RegulatoryCalendarPanel events={data.regulatoryCalendar} lang={lang} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
