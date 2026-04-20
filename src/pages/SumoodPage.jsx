import { useState } from "react";
import { useApp } from "../context/AppContext";
import SumoodDashboard from "../components/sumood/SumoodDashboard";
import SumoodSelfAssessment from "../components/sumood/SumoodSelfAssessment";
import SumoodGapAnalysis from "../components/sumood/SumoodGapAnalysis";
import SumoodDocumentCompliance from "../components/sumood/SumoodDocumentCompliance";
import { Target, BarChart3, FileCheck, FileText } from "lucide-react";

export default function SumoodPage() {
  const { language, isRTL, t } = useApp();
  const lang = language;
  const [subTab, setSubTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: isRTL ? "لوحة المعلومات" : "Dashboard", icon: BarChart3 },
    { id: "assessment", label: isRTL ? "التقييم الذاتي" : "Self-Assessment", icon: FileCheck },
    { id: "gap", label: isRTL ? "تحليل الفجوات" : "Gap Analysis", icon: Target },
    { id: "documents", label: isRTL ? "الامتثال الوثائقي" : "Document Compliance", icon: FileText },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className={`mb-5 ${isRTL ? "text-right" : ""}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white m-0">{t('sumood.title')}</h1>
            <p className="text-xs text-slate-400 m-0">{isRTL ? "تقييم النضج المؤسسي وفق مؤشر صمود الوطني" : "National Resilience Index — Maturity Assessment Platform"}</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap
                ${subTab === tab.id
                  ? "bg-violet-950 text-violet-400 border-violet-800"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === "dashboard" && <SumoodDashboard lang={lang} />}
      {subTab === "assessment" && <SumoodSelfAssessment lang={lang} />}
      {subTab === "gap" && <SumoodGapAnalysis lang={lang} />}
      {subTab === "documents" && <SumoodDocumentCompliance lang={lang} />}
    </div>
  );
}
