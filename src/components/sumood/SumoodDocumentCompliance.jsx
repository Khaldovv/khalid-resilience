import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, File, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Sparkles, BarChart3, Trash2, RefreshCw, ArrowRight, ArrowLeft, X, Shield, TrendingUp, Brain, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockSumoodDocuments, getMockMappingsForDocument } from '../../data/mockSumoodCompliance';
import { useSumood } from '../../context/SumoodContext';

// ─── Translations ─────────────────────────────────────────────────────────────
const t = (key, lang) => {
  const dict = {
    'pageTitle':        { ar: 'مطابقة المستندات مع معايير صمود', en: 'Document Compliance with Sumood' },
    'pageSubtitle':     { ar: 'ارفع مستندات مؤسستك ودع الذكاء الاصطناعي يحلل مدى مطابقتها مع مؤشر صمود', en: 'Upload your organizational documents and let AI analyze compliance with Sumood' },
    'uploadArea':       { ar: 'اسحب المستندات هنا أو اضغط للاختيار', en: 'Drag documents here or click to select' },
    'supportedTypes':   { ar: 'PDF, DOCX, XLSX, TXT — الحد الأقصى 50MB', en: 'PDF, DOCX, XLSX, TXT — Max 50MB' },
    'fiscalYear':       { ar: 'السنة المالية', en: 'Fiscal Year' },
    'analyzing':        { ar: 'جاري التحليل بالذكاء الاصطناعي...', en: 'Analyzing with AI...' },
    'analyzed':         { ar: 'تم التحليل', en: 'Analyzed' },
    'failed':           { ar: 'فشل التحليل', en: 'Analysis Failed' },
    'fullyMet':         { ar: 'مستوفاة بالكامل', en: 'Fully Met' },
    'partiallyMet':     { ar: 'مستوفاة جزئياً', en: 'Partially Met' },
    'mentioned':        { ar: 'مذكورة', en: 'Mentioned' },
    'notAddressed':     { ar: 'غير معالجة', en: 'Not Addressed' },
    'executiveSummary': { ar: 'الملخص التنفيذي', en: 'Executive Summary' },
    'pillarCoverage':   { ar: 'تغطية المحاور', en: 'Pillar Coverage' },
    'kpiMappings':      { ar: 'تفاصيل المقاييس', en: 'KPI Details' },
    'evidence':         { ar: 'الدليل', en: 'Evidence' },
    'aiReasoning':      { ar: 'تحليل الذكاء الاصطناعي', en: 'AI Reasoning' },
    'identifiedGaps':   { ar: 'الفجوات المحددة', en: 'Identified Gaps' },
    'suggestions':      { ar: 'اقتراحات التحسين', en: 'Improvement Suggestions' },
    'applyAll':         { ar: 'تطبيق كل التوصيات عالية الثقة', en: 'Apply All High-Confidence' },
    'reanalyze':        { ar: 'إعادة التحليل', en: 'Re-analyze' },
    'delete':           { ar: 'حذف المستند', en: 'Delete Document' },
    'viewDetails':      { ar: 'عرض التفاصيل', en: 'View Details' },
    'confidence':       { ar: 'مستوى الثقة', en: 'Confidence' },
    'maturity':         { ar: 'مستوى النضج المقترح', en: 'Suggested Maturity' },
    'page':             { ar: 'صفحة', en: 'Page' },
    'uploadedDocs':     { ar: 'المستندات المرفوعة', en: 'Uploaded Documents' },
    'coverageOverview': { ar: 'نظرة عامة على التغطية', en: 'Coverage Overview' },
    'close':            { ar: 'إغلاق', en: 'Close' },
    'applyToAssessment':{ ar: 'تطبيق على التقييم الذاتي', en: 'Apply to Assessment' },
    'applied':          { ar: 'تم التطبيق', en: 'Applied' },
    'uploadSuccess':    { ar: 'تم الرفع — يحاكي التحليل بالبيانات التجريبية', en: 'Uploaded — simulating with mock data' },
    'noDocsYet':        { ar: 'لم يتم رفع أي مستند بعد', en: 'No documents uploaded yet' },
  };
  return (dict[key] || {})[lang] || key;
};

// ─── File icon by type ────────────────────────────────────────────────────────
const FileIcon = ({ type, size = 20 }) => {
  if (type?.includes('pdf')) return <FileText size={size} className="text-red-400" />;
  if (type?.includes('spreadsheet') || type?.includes('xlsx') || type?.includes('xls'))
    return <FileSpreadsheet size={size} className="text-emerald-400" />;
  if (type?.includes('word') || type?.includes('docx'))
    return <FileText size={size} className="text-blue-400" />;
  return <File size={size} className="text-slate-400" />;
};

// ─── Compliance badge ─────────────────────────────────────────────────────────
const ComplianceBadge = ({ level, lang }) => {
  const styles = {
    FULLY_MET:     { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-800', label: t('fullyMet', lang) },
    PARTIALLY_MET: { bg: 'bg-amber-950',   text: 'text-amber-400',   border: 'border-amber-800',   label: t('partiallyMet', lang) },
    MENTIONED:     { bg: 'bg-blue-950',     text: 'text-blue-400',    border: 'border-blue-800',     label: t('mentioned', lang) },
    NOT_ADDRESSED: { bg: 'bg-red-950',      text: 'text-red-400',     border: 'border-red-800',      label: t('notAddressed', lang) },
  };
  const s = styles[level] || styles.NOT_ADDRESSED;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>;
};

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
const CoverageDonut = ({ summary, lang }) => {
  const data = [
    { name: t('fullyMet', lang), value: summary.kpis_fully_met, color: '#10b981' },
    { name: t('partiallyMet', lang), value: summary.kpis_partially_met, color: '#f59e0b' },
    { name: t('mentioned', lang), value: summary.kpis_mentioned, color: '#3b82f6' },
    { name: t('notAddressed', lang), value: summary.kpis_not_addressed, color: '#ef4444' },
  ];
  const total = data.reduce((a, d) => a + d.value, 0);
  const covered = summary.kpis_fully_met + summary.kpis_partially_met;
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3} strokeWidth={0}>
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{pct}%</span>
          <span className="text-[9px] text-slate-500">{lang === 'ar' ? 'تغطية' : 'Coverage'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <div>
              <span className="text-lg font-bold text-white">{d.value}</span>
              <span className="text-[10px] text-slate-500 block leading-tight">{d.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PILLAR BAR CHART ─────────────────────────────────────────────────────────
const PillarCoverageChart = ({ pillarCoverage, lang }) => {
  const pillarNames = {
    P1: { ar: 'إدارة المخاطر', en: 'Risk Management' },
    P2: { ar: 'الطوارئ والأزمات', en: 'Emergency & Crisis' },
    P3: { ar: 'استمرارية الأعمال', en: 'Business Continuity' },
    P4: { ar: 'تقنية المعلومات', en: 'ICT Management' },
    P5: { ar: 'القدرات المؤسسية', en: 'Org. Capabilities' },
  };
  const data = Object.entries(pillarCoverage).map(([id, pct]) => ({
    name: pillarNames[id]?.[lang] || id,
    value: Math.round(pct),
    color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444',
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: lang === 'ar' ? 10 : 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={lang === 'ar' ? 110 : 130} />
        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}%`, lang === 'ar' ? 'التغطية' : 'Coverage']} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── KPI MAPPING ROW ──────────────────────────────────────────────────────────
const KPIMappingRow = ({ mapping, lang, onApply, applied }) => {
  const [expanded, setExpanded] = useState(false);
  const isRtl = lang === 'ar';

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden transition-all duration-200 hover:border-slate-700">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-[10px] font-mono text-cyan-400 flex-shrink-0">{mapping.kpi_code}</span>
          <span className="text-xs text-slate-300 truncate">{mapping.kpi_text_ar}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ComplianceBadge level={mapping.compliance_level} lang={lang} />
          <span className="text-[10px] font-mono text-violet-400 bg-violet-950 border border-violet-800 px-1.5 py-0.5 rounded">
            L{mapping.suggested_maturity_level}
          </span>
          <span className="text-[10px] text-slate-500">{Math.round(mapping.confidence_score * 100)}%</span>
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800 space-y-3" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          {/* Evidence */}
          {mapping.evidence_quote && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Shield size={10} /> {t('evidence', lang)}</p>
              <div className="bg-slate-800/50 rounded-lg p-3 border-r-2 border-cyan-500">
                <p className="text-xs text-slate-300 italic leading-relaxed">"{mapping.evidence_quote}"</p>
                {mapping.evidence_page_number && (
                  <p className="text-[10px] text-slate-500 mt-1">— {t('page', lang)} {mapping.evidence_page_number}{mapping.evidence_section ? ` · ${mapping.evidence_section}` : ''}</p>
                )}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          <div>
            <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Brain size={10} /> {t('aiReasoning', lang)}</p>
            <p className="text-xs text-slate-400">{isRtl ? mapping.reasoning_ar : mapping.reasoning_en}</p>
          </div>

          {/* Gaps */}
          {(mapping.identified_gaps_ar || mapping.identified_gaps_en) && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><AlertCircle size={10} className="text-red-400" /> {t('identifiedGaps', lang)}</p>
              <p className="text-xs text-red-300/80">{isRtl ? mapping.identified_gaps_ar : mapping.identified_gaps_en}</p>
            </div>
          )}

          {/* Improvement Suggestions */}
          {mapping.improvement_suggestions?.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Zap size={10} className="text-amber-400" /> {t('suggestions', lang)}</p>
              <div className="space-y-1.5">
                {mapping.improvement_suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-800/30 rounded-lg p-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                      s.priority === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-800' :
                      s.priority === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>{s.priority}</span>
                    <p className="text-xs text-slate-300">{isRtl ? s.suggestion_ar : s.suggestion_en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply button */}
          {mapping.compliance_level === 'FULLY_MET' && mapping.confidence_score >= 0.7 && (
            <button onClick={onApply} disabled={applied}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                applied ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default' :
                'bg-violet-600 hover:bg-violet-500 text-white'}`}>
              {applied ? <><CheckCircle2 size={12} /> {t('applied', lang)}</> : <><TrendingUp size={12} /> {t('applyToAssessment', lang)}</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SumoodDocumentCompliance({ lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const [documents, setDocuments] = useState(mockSumoodDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [appliedKpis, setAppliedKpis] = useState(new Set());
  const fileInputRef = useRef(null);
  const { submitAssessment } = useSumood();

  // Auto-complete any pre-existing ANALYZING documents after 5s (mock simulation)
  useEffect(() => {
    const analyzingDocs = documents.filter(d => d.status === 'ANALYZING');
    if (analyzingDocs.length === 0) return;
    const timer = setTimeout(() => {
      setDocuments(prev => prev.map(d => {
        if (d.status !== 'ANALYZING') return d;
        return {
          ...d,
          status: 'ANALYZED',
          total_pages: Math.floor(Math.random() * 40) + 10,
          ai_model: 'deepseek-v3',
          analyzed_at: new Date().toISOString(),
          summary: {
            total_kpis_assessed: 30,
            kpis_fully_met: Math.floor(Math.random() * 8) + 6,
            kpis_partially_met: Math.floor(Math.random() * 6) + 4,
            kpis_mentioned: Math.floor(Math.random() * 4) + 2,
            kpis_not_addressed: Math.floor(Math.random() * 5) + 2,
            overall_coverage_pct: Math.floor(Math.random() * 25) + 55,
            pillar_coverage: { P1: Math.random() * 30 + 50, P2: Math.random() * 30 + 40, P3: Math.random() * 30 + 55, P4: Math.random() * 30 + 45, P5: Math.random() * 30 + 35 },
            executive_summary_ar: `تحليل مستند "${d.file_name}" أظهر تغطية جيدة لمتطلبات مؤشر صمود. يغطي المستند جوانب متعددة من الإطار مع توصيات بتعزيز بعض المجالات.`,
            executive_summary_en: `Analysis of "${d.file_name}" shows good coverage of Sumood requirements across multiple framework areas with recommendations to strengthen certain domains.`,
          },
        };
      }));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Drag handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (file) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 10;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(null);
      const newDocId = `doc-new-${Date.now()}`;
      const newDoc = {
        id: newDocId,
        file_name: file.name, file_type: file.type,
        file_size_bytes: file.size, document_type: 'OTHER',
        document_type_ar: 'آخر', status: 'ANALYZING',
        total_pages: null, ai_model: null,
        created_at: new Date().toISOString(), analyzed_at: null,
        uploaded_by_name: lang === 'ar' ? 'المستخدم الحالي' : 'Current User',
        document_summary_ar: null, document_summary_en: null, summary: null,
      };
      setDocuments(prev => [newDoc, ...prev]);

      // Auto-complete analysis after 4 seconds with mock data
      setTimeout(() => {
        setDocuments(prev => prev.map(d => {
          if (d.id !== newDocId) return d;
          return {
            ...d,
            status: 'ANALYZED',
            total_pages: Math.floor(Math.random() * 40) + 10,
            ai_model: 'deepseek-v3',
            analyzed_at: new Date().toISOString(),
            summary: {
              total_kpis_assessed: 25,
              kpis_fully_met: Math.floor(Math.random() * 8) + 5,
              kpis_partially_met: Math.floor(Math.random() * 6) + 3,
              kpis_mentioned: Math.floor(Math.random() * 4) + 2,
              kpis_not_addressed: Math.floor(Math.random() * 5) + 2,
              overall_coverage_pct: Math.floor(Math.random() * 30) + 50,
              pillar_coverage: { P1: Math.random() * 40 + 40, P2: Math.random() * 40 + 30, P3: Math.random() * 40 + 45, P4: Math.random() * 40 + 35, P5: Math.random() * 40 + 25 },
              executive_summary_ar: `تحليل مستند "${file.name}" أظهر تغطية جيدة لمتطلبات مؤشر صمود في المحاور الأساسية. يُوصى بتعزيز التغطية في محور إدارة الطوارئ والأزمات والقدرات المؤسسية.`,
              executive_summary_en: `Analysis of "${file.name}" shows good coverage of Sumood requirements in core pillars. Recommended to strengthen Emergency & Crisis Management and Organizational Capabilities coverage.`,
            },
          };
        }));
      }, 4000);
    }, 2500);
  };

  // Get detail data
  const getDocDetail = () => {
    if (!selectedDoc) return null;
    const doc = documents.find(d => d.id === selectedDoc);
    if (!doc || doc.status !== 'ANALYZED') return null;
    const mappings = getMockMappingsForDocument(doc.id);
    return { doc, mappings };
  };

  const detail = getDocDetail();

  // Group mappings by pillar
  const groupedMappings = detail?.mappings.reduce((acc, m) => {
    const key = m.pillar_name || m.pillar_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {}) || {};

  // Apply single KPI to self-assessment
  const handleApplyKPI = (mapping) => {
    submitAssessment(mapping.kpi_id, 'IT', 2026, mapping.suggested_maturity_level,
      `AI-analyzed from document. Evidence: ${mapping.evidence_quote?.substring(0, 200) || 'N/A'}`);
    setAppliedKpis(prev => new Set([...prev, mapping.kpi_id]));
  };

  // Apply all high-confidence
  const handleApplyAll = () => {
    if (!detail) return;
    const eligible = detail.mappings.filter(m => m.compliance_level === 'FULLY_MET' && m.confidence_score >= 0.7);
    eligible.forEach(m => handleApplyKPI(m));
  };

  return (
    <div className="space-y-5 fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500 tracking-wider">{t('pageTitle', lang).toUpperCase()}</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.1))', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.3)' }}>
              <Sparkles size={9} className="inline -mt-0.5" /> AI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{t('pageSubtitle', lang)}</p>
        </div>
      </div>

      {/* ═══ SECTION 1: Upload Area ═══ */}
      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging ? 'border-cyan-400 scale-[1.01]' : 'border-slate-700 hover:border-slate-600'}`}
        style={{
          background: isDragging
            ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))'
            : 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(30,41,59,0.3))',
        }}>
        <input ref={fileInputRef} type="file" className="hidden"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} />

        {uploadProgress !== null ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <RefreshCw size={20} className="text-cyan-400 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-cyan-400">{t('analyzing', lang)}</p>
            <div className="max-w-xs mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'scale-110' : ''}`}
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <Upload size={24} className={`transition-colors ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
            </div>
            <p className={`text-sm font-semibold ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`}>{t('uploadArea', lang)}</p>
            <p className="text-[11px] text-slate-600">{t('supportedTypes', lang)}</p>
          </div>
        )}

        {/* Animated corners */}
        {isDragging && <>
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
        </>}
      </div>

      {/* ═══ SECTION 2: Document Cards ═══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400">
            {t('uploadedDocs', lang)} <span className="text-slate-600 font-mono">({documents.length})</span>
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <FileText size={32} className="mx-auto mb-2" />
            <p className="text-xs">{t('noDocsYet', lang)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div key={doc.id}
                className={`rounded-xl border bg-slate-900/60 p-4 transition-all duration-200 cursor-pointer hover:border-slate-600 ${
                  selectedDoc === doc.id ? 'border-violet-700 ring-1 ring-violet-700/30' : 'border-slate-800'}`}
                onClick={() => doc.status === 'ANALYZED' && setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: doc.file_type?.includes('pdf') ? 'rgba(239,68,68,0.1)' : doc.file_type?.includes('word') || doc.file_type?.includes('docx') ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                             border: `1px solid ${doc.file_type?.includes('pdf') ? 'rgba(239,68,68,0.2)' : doc.file_type?.includes('word') || doc.file_type?.includes('docx') ? 'rgba(59,130,246,0.2)' : 'rgba(100,116,139,0.2)'}` }}>
                    <FileIcon type={doc.file_type} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {doc.document_type_ar && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {isRtl ? doc.document_type_ar : doc.document_type}
                        </span>
                      )}
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                        doc.status === 'ANALYZED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        doc.status === 'ANALYZING' ? 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse' :
                        doc.status === 'FAILED' ? 'bg-red-950 text-red-400 border-red-800' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {doc.status === 'ANALYZED' ? `✅ ${t('analyzed', lang)}` :
                         doc.status === 'ANALYZING' ? `🔄 ${t('analyzing', lang)}` :
                         doc.status === 'FAILED' ? `❌ ${t('failed', lang)}` : 'UPLOADED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini stats for analyzed docs */}
                {doc.status === 'ANALYZED' && doc.summary && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { val: doc.summary.kpis_fully_met, color: '#10b981', label: t('fullyMet', lang) },
                        { val: doc.summary.kpis_partially_met, color: '#f59e0b', label: t('partiallyMet', lang) },
                        { val: doc.summary.kpis_mentioned, color: '#3b82f6', label: t('mentioned', lang) },
                        { val: doc.summary.kpis_not_addressed, color: '#ef4444', label: t('notAddressed', lang) },
                      ].map((s, i) => (
                        <div key={i}>
                          <p className="text-sm font-bold" style={{ color: s.color }}>{s.val}</p>
                          <p className="text-[8px] text-slate-600 leading-tight">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                        {[
                          { pct: doc.summary.kpis_fully_met / doc.summary.total_kpis_assessed * 100, color: '#10b981' },
                          { pct: doc.summary.kpis_partially_met / doc.summary.total_kpis_assessed * 100, color: '#f59e0b' },
                          { pct: doc.summary.kpis_mentioned / doc.summary.total_kpis_assessed * 100, color: '#3b82f6' },
                          { pct: doc.summary.kpis_not_addressed / doc.summary.total_kpis_assessed * 100, color: '#ef4444' },
                        ].map((seg, i) => (
                          <div key={i} style={{ width: `${seg.pct}%`, background: seg.color }} className="h-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ SECTION 3: Analysis Detail View ═══ */}
      {selectedDoc && detail && (
        <div className="rounded-2xl border border-slate-700 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(30,41,59,0.5))' }}>
          {/* Detail Header */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <FileIcon type={detail.doc.file_type} size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{detail.doc.file_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                    <span>{detail.doc.uploaded_by_name}</span>
                    <span>·</span>
                    <span>{detail.doc.total_pages} {lang === 'ar' ? 'صفحة' : 'pages'}</span>
                    <span>·</span>
                    <span className="text-violet-400">{detail.doc.ai_model}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-700 hover:border-slate-500 transition-colors bg-slate-800/50">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {/* Executive Summary */}
            <div className="mt-4 p-4 rounded-xl border border-slate-800" style={{ background: 'rgba(139,92,246,0.04)' }}>
              <p className="text-[10px] text-violet-400 font-semibold mb-2 flex items-center gap-1.5">
                <Sparkles size={11} /> {t('executiveSummary', lang)}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isRtl ? detail.doc.summary.executive_summary_ar : detail.doc.summary.executive_summary_en}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
            {/* Coverage Donut */}
            <div className="rounded-xl border border-slate-800 p-4" style={{ background: 'rgba(15,23,42,0.6)' }}>
              <p className="text-[10px] text-slate-500 mb-3 font-semibold">{t('coverageOverview', lang)}</p>
              <CoverageDonut summary={detail.doc.summary} lang={lang} />
            </div>

            {/* Pillar Bar Chart */}
            <div className="rounded-xl border border-slate-800 p-4" style={{ background: 'rgba(15,23,42,0.6)' }}>
              <p className="text-[10px] text-slate-500 mb-3 font-semibold">{t('pillarCoverage', lang)}</p>
              <PillarCoverageChart pillarCoverage={detail.doc.summary.pillar_coverage} lang={lang} />
            </div>
          </div>

          {/* KPI Mappings */}
          <div className="p-5 pt-0">
            <p className="text-[10px] text-slate-500 mb-3 font-semibold">{t('kpiMappings', lang)}</p>
            <div className="space-y-4">
              {Object.entries(groupedMappings).map(([pillarName, mappings]) => (
                <PillarSection key={pillarName} pillarName={pillarName} mappings={mappings} lang={lang}
                  appliedKpis={appliedKpis} onApplyKPI={handleApplyKPI} />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 pt-0">
            <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-slate-800" style={{ background: 'rgba(15,23,42,0.6)' }}>
              <button onClick={handleApplyAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff' }}>
                <Zap size={13} /> {t('applyAll', lang)}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors">
                <RefreshCw size={13} /> {t('reanalyze', lang)}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-950 text-red-400 border border-red-800 hover:border-red-700 transition-colors">
                <Trash2 size={13} /> {t('delete', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pillar Section (collapsible) ─────────────────────────────────────────────
function PillarSection({ pillarName, mappings, lang, appliedKpis, onApplyKPI }) {
  const [open, setOpen] = useState(true);
  const fullyMet = mappings.filter(m => m.compliance_level === 'FULLY_MET').length;
  const total = mappings.length;

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden" style={{ background: 'rgba(15,23,42,0.4)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors"
        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="flex items-center gap-2">
          {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          <span className="text-xs font-bold text-white">{pillarName}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400 font-mono">{fullyMet}/{total}</span>
          <span className="text-slate-600">{lang === 'ar' ? 'مستوفاة' : 'met'}</span>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          {mappings.map((m) => (
            <KPIMappingRow key={m.kpi_id} mapping={m} lang={lang}
              applied={appliedKpis.has(m.kpi_id)} onApply={() => onApplyKPI(m)} />
          ))}
        </div>
      )}
    </div>
  );
}
