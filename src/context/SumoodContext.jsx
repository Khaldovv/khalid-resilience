import { createContext, useContext, useState, useCallback, useMemo } from "react";

// ─── 7-Level Maturity Scale (مؤشر صمود) ──────────────────────────────────────
const MATURITY_LEVELS = [
  { level: 1, ar: "غير مطبق", en: "Not Applied",    color: "#64748b", bg: "bg-slate-600" },
  { level: 2, ar: "مبتدئ",   en: "Beginner",       color: "#ef4444", bg: "bg-red-500" },
  { level: 3, ar: "نامي",    en: "Developing",     color: "#f97316", bg: "bg-orange-500" },
  { level: 4, ar: "متقدم",   en: "Advanced",       color: "#eab308", bg: "bg-yellow-500" },
  { level: 5, ar: "مكتمل",   en: "Complete",       color: "#22c55e", bg: "bg-green-500" },
  { level: 6, ar: "متميز",   en: "Distinguished",  color: "#06b6d4", bg: "bg-cyan-500" },
  { level: 7, ar: "ريادي",   en: "Leading",        color: "#8b5cf6", bg: "bg-violet-500" },
];

// ─── 5 Pillars + 16 Components + 113 KPIs ─────────────────────────────────────
// Abbreviated KPI generation — realistic distribution across pillars/components
const buildSumoodData = () => {
  const pillars = [
    {
      id: "P1", name_ar: "إدارة المخاطر", name_en: "Risk Management", sort: 1,
      components: [
        { id: "P1-C1", code: "RM-01", name_ar: "حوكمة المخاطر المؤسسية", name_en: "Enterprise Risk Governance", kpiCount: 8 },
        { id: "P1-C2", code: "RM-02", name_ar: "تقييم المخاطر وتحليلها", name_en: "Risk Assessment & Analysis", kpiCount: 7 },
        { id: "P1-C3", code: "RM-03", name_ar: "معالجة المخاطر ومراقبتها", name_en: "Risk Treatment & Monitoring", kpiCount: 7 },
      ],
    },
    {
      id: "P2", name_ar: "إدارة الطوارئ والأزمات", name_en: "Emergency & Crisis Management", sort: 2,
      components: [
        { id: "P2-C1", code: "EC-01", name_ar: "التخطيط والاستعداد للطوارئ", name_en: "Emergency Planning & Preparedness", kpiCount: 8 },
        { id: "P2-C2", code: "EC-02", name_ar: "الاستجابة للأزمات", name_en: "Crisis Response", kpiCount: 7 },
        { id: "P2-C3", code: "EC-03", name_ar: "التعافي وإعادة التأهيل", name_en: "Recovery & Rehabilitation", kpiCount: 7 },
      ],
    },
    {
      id: "P3", name_ar: "استمرارية الأعمال", name_en: "Business Continuity", sort: 3,
      components: [
        { id: "P3-C1", code: "BC-01", name_ar: "تحليل تأثير الأعمال (BIA)", name_en: "Business Impact Analysis (BIA)", kpiCount: 8 },
        { id: "P3-C2", code: "BC-02", name_ar: "استراتيجيات الاستمرارية", name_en: "Continuity Strategies", kpiCount: 7 },
        { id: "P3-C3", code: "BC-03", name_ar: "خطط استمرارية الأعمال", name_en: "Business Continuity Plans", kpiCount: 7 },
        { id: "P3-C4", code: "BC-04", name_ar: "التمارين والاختبارات", name_en: "Exercises & Testing", kpiCount: 7 },
      ],
    },
    {
      id: "P4", name_ar: "إدارة تقنية المعلومات والاتصالات", name_en: "ICT Management", sort: 4,
      components: [
        { id: "P4-C1", code: "IT-01", name_ar: "البنية التحتية والتعافي من الكوارث", name_en: "Infrastructure & Disaster Recovery", kpiCount: 8 },
        { id: "P4-C2", code: "IT-02", name_ar: "الأمن السيبراني وحماية البيانات", name_en: "Cybersecurity & Data Protection", kpiCount: 7 },
        { id: "P4-C3", code: "IT-03", name_ar: "إدارة الموردين التقنيين", name_en: "ICT Vendor Management", kpiCount: 6 },
      ],
    },
    {
      id: "P5", name_ar: "القدرات المؤسسية والثقافة", name_en: "Organizational Capabilities & Culture", sort: 5,
      components: [
        { id: "P5-C1", code: "OC-01", name_ar: "القيادة والحوكمة", name_en: "Leadership & Governance", kpiCount: 8 },
        { id: "P5-C2", code: "OC-02", name_ar: "التدريب وبناء القدرات", name_en: "Training & Capacity Building", kpiCount: 7 },
        { id: "P5-C3", code: "OC-03", name_ar: "ثقافة الصمود المؤسسي", name_en: "Organizational Resilience Culture", kpiCount: 7 },
      ],
    },
  ];

  // Generate realistic KPIs for each component
  const kpiTemplates = {
    "RM-01": [
      "وجود سياسة معتمدة لإدارة المخاطر المؤسسية",
      "تحديد أدوار ومسؤوليات إدارة المخاطر",
      "وجود لجنة حوكمة مخاطر معتمدة",
      "ربط سجل المخاطر بالأهداف الاستراتيجية",
      "تحديث دوري لإطار الرغبة في المخاطر",
      "وجود آلية تصعيد للمخاطر ذات الأولوية",
      "مراجعة مستقلة لنظام إدارة المخاطر",
      "التكامل مع إطار الضبط الداخلي",
    ],
    "RM-02": [
      "تطبيق منهجية موحدة لتقييم المخاطر",
      "تنفيذ تقييمات مخاطر دورية",
      "تحليل السيناريوهات واختبارات الإجهاد",
      "تقييم مخاطر الأطراف الثالثة",
      "تحديد المخاطر الناشئة والمستقبلية",
      "استخدام أدوات تحليل كمية ونوعية",
      "توثيق نتائج التقييمات ومتابعتها",
    ],
    "RM-03": [
      "وجود خطط معالجة معتمدة لكل مخاطرة",
      "تنفيذ ضوابط رقابية فعالة",
      "مراقبة مؤشرات المخاطر الرئيسية (KRIs)",
      "التقارير الدورية لأصحاب المصلحة",
      "مراجعة فعالية خطط المعالجة",
      "آلية التحسين المستمر",
      "التكامل مع نظام الامتثال",
    ],
    "EC-01": [
      "وجود خطة طوارئ شاملة ومعتمدة",
      "تحديد سيناريوهات الطوارئ المحتملة",
      "تجهيز مركز عمليات الطوارئ (EOC)",
      "إعداد بروتوكولات الاتصال والإنذار المبكر",
      "تحديد الموارد اللازمة للاستجابة",
      "برنامج تدريب وتمارين الطوارئ",
      "التنسيق مع الجهات الخارجية",
      "مراجعة ما بعد الحادث وتحديث الخطط",
    ],
    "EC-02": [
      "وجود فريق إدارة أزمات معتمد",
      "بروتوكولات تفعيل الأزمات",
      "آلية اتخاذ القرارات السريعة",
      "إدارة الاتصالات أثناء الأزمة",
      "التنسيق مع وسائل الإعلام",
      "إدارة أصحاب المصلحة أثناء الأزمة",
      "تقييم الوضع ورفع التقارير الآنية",
    ],
    "EC-03": [
      "خطط التعافي المرحلية",
      "تحديد أولويات التعافي",
      "إعادة تأهيل الموارد البشرية",
      "استئناف العمليات التشغيلية",
      "تقييم الخسائر والأضرار",
      "الدروس المستفادة وتحديث الخطط",
      "التواصل مع المتأثرين",
    ],
    "BC-01": [
      "تنفيذ تحليل تأثير أعمال شامل",
      "تحديد MTPD و RTO و RPO لكل عملية",
      "تقييم تأثيرات الانقطاع عبر الفئات",
      "تحديد خريطة الاعتماديات",
      "تحديد الحد الأدنى لاستمرارية الأعمال (MBCO)",
      "مراجعة دورية لنتائج BIA",
      "ربط نتائج BIA بسجل المخاطر",
      "تجميع نتائج BIA على مستوى المؤسسة",
    ],
    "BC-02": [
      "تحديد استراتيجيات استمرارية لكل عملية حيوية",
      "تقييم تكلفة وفاعلية الاستراتيجيات",
      "وجود مواقع بديلة للعمل",
      "حلول تقنية بديلة لأنظمة الأعمال",
      "ترتيبات الموردين البديلين",
      "استراتيجيات إدارة الأفراد البديلة",
      "آليات حماية السجلات الحيوية",
    ],
    "BC-03": [
      "وجود خطط استمرارية أعمال معتمدة",
      "تحديد فرق الاستجابة والتعافي",
      "بروتوكولات التفعيل والإيقاف",
      "قوائم الاتصال وسلاسل الإبلاغ",
      "إجراءات العمل البديلة الموثقة",
      "آلية توزيع ووصول للخطط",
      "خطط محددة لكل موقع/إدارة",
    ],
    "BC-04": [
      "برنامج اختبارات وتمارين سنوي",
      "تنوع أساليب التمارين",
      "مشاركة الإدارة العليا في التمارين",
      "اختبار فعالية الموردين البديلين",
      "توثيق نتائج التمارين والتوصيات",
      "متابعة تنفيذ توصيات التمارين",
      "تمارين مشتركة مع أطراف خارجية",
    ],
    "IT-01": [
      "خطة تعافي تقنية معتمدة من الكوارث (DRP)",
      "موقع تعافي بديل (DR Site)",
      "النسخ الاحتياطي المنتظم والاختبار",
      "استعادة الأنظمة خلال RTO المحدد",
      "تجارب تعافي دورية واختبار التحويل",
      "إدارة السعة والموارد التقنية",
      "مراقبة أداء البنية التحتية 24×7",
      "إدارة التغييرات التقنية والأمنية",
    ],
    "IT-02": [
      "تطبيق ضوابط NCA للأمن السيبراني",
      "إدارة الثغرات الأمنية",
      "الحماية من البرمجيات الخبيثة",
      "إدارة الهوية والوصول (IAM)",
      "تشفير البيانات الحيوية",
      "رصد التهديدات السيبرانية (SOC)",
      "خطة استجابة للحوادث السيبرانية",
    ],
    "IT-03": [
      "تقييم مخاطر الموردين التقنيين",
      "اتفاقيات مستوى الخدمة (SLA)",
      "خطط بديلة للموردين الحيويين",
      "إدارة العقود والتجديدات",
      "مراقبة أداء الموردين",
      "عقود حق الوصول والتدقيق",
    ],
    "OC-01": [
      "التزام الإدارة العليا بالصمود المؤسسي",
      "تخصيص ميزانية كافية",
      "هيكل حوكمة واضح ومعتمد",
      "تقارير دورية لمجلس الإدارة",
      "تكامل الصمود مع التخطيط الاستراتيجي",
      "سياسات معتمدة ومنشورة",
      "إدارة الأداء ومؤشرات القياس",
      "المراجعة الدورية لنظام الإدارة",
    ],
    "OC-02": [
      "برنامج تدريب شامل معتمد",
      "تدريب متخصص لفرق الاستجابة",
      "التوعية العامة لجميع الموظفين",
      "تطوير الكفاءات المهنية",
      "شهادات مهنية للعاملين",
      "قياس فعالية التدريب",
      "التدريب على أنظمة وتقنيات الصمود",
    ],
    "OC-03": [
      "نشر ثقافة الصمود في المنظمة",
      "مشاركة الدروس المستفادة",
      "برامج التحفيز والتقدير",
      "التواصل الفعال حول الصمود",
      "قياس مستوى الوعي المؤسسي",
      "مبادرات الابتكار في الصمود",
      "المشاركة في المجتمعات الوطنية والدولية",
    ],
  };

  // Build KPIs
  const allKpis = [];
  let kpiGlobal = 0;
  pillars.forEach((pillar) => {
    pillar.components.forEach((comp) => {
      const texts = kpiTemplates[comp.code] || [];
      texts.forEach((text, i) => {
        kpiGlobal++;
        allKpis.push({
          id: `KPI-${String(kpiGlobal).padStart(3, "0")}`,
          component_id: comp.id,
          pillar_id: pillar.id,
          kpi_code: `${comp.code}-${String(i + 1).padStart(3, "0")}`,
          kpi_text_ar: text,
          kpi_text_en: text, // In production would have EN translation
          weight: 1.0,
          is_applicable: true,
        });
      });
    });
  });

  return { pillars, allKpis };
};

// ─── Seed Assessment Data (realistic scores) ─────────────────────────────────
const buildSeedAssessments = (kpis) => {
  // Simulate self-assessment for "IT" department, 2026
  const scores = {};
  const baseScores = {
    P1: [5,5,4,6,4,5,4,5, 5,4,4,5,4,3,4, 4,5,4,5,4,4,5],
    P2: [4,5,3,4,4,3,4,5, 4,3,4,3,3,4,3, 3,4,3,3,4,3,3],
    P3: [5,5,4,5,4,4,5,4, 4,4,5,4,3,4,3, 4,5,3,4,4,3,4, 3,4,3,3,3,4,3],
    P4: [6,5,5,5,5,4,5,4, 5,4,5,5,4,5,4, 4,4,4,3,3,4],
    P5: [5,4,5,4,4,5,4,5, 4,3,3,4,3,4,3, 4,3,4,3,3,3,4],
  };

  let idx = {};
  kpis.forEach((kpi) => {
    const pId = kpi.pillar_id;
    if (!idx[pId]) idx[pId] = 0;
    const arr = baseScores[pId] || [];
    const level = arr[idx[pId] % arr.length] || 3;
    scores[kpi.id] = {
      id: `SA-${kpi.id}`,
      kpi_id: kpi.id,
      department_id: "IT",
      fiscal_year: 2026,
      maturity_level: level,
      evidence_notes: "",
      attachments: [],
    };
    idx[pId]++;
  });

  return Object.values(scores);
};

// ─── Context ──────────────────────────────────────────────────────────────────
const SumoodContext = createContext();

export function SumoodProvider({ children }) {
  const { pillars, allKpis } = useMemo(() => buildSumoodData(), []);
  const [selfAssessments, setSelfAssessments] = useState(() => buildSeedAssessments(allKpis));

  // ─── Submit / Update Assessment ───
  const submitAssessment = useCallback((kpiId, deptId, year, maturityLevel, evidence = "", attachments = []) => {
    if (maturityLevel < 1 || maturityLevel > 7) throw new Error("Maturity level must be 1–7");
    setSelfAssessments((prev) => {
      const idx = prev.findIndex((a) => a.kpi_id === kpiId && a.department_id === deptId && a.fiscal_year === year);
      const entry = {
        id: idx >= 0 ? prev[idx].id : `SA-${kpiId}-${deptId}-${year}`,
        kpi_id: kpiId, department_id: deptId, fiscal_year: year,
        maturity_level: maturityLevel, evidence_notes: evidence, attachments,
      };
      if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
  }, []);

  // ─── Batch Submit ───
  const batchSubmit = useCallback((entries) => {
    entries.forEach(({ kpiId, deptId, year, maturityLevel, evidence, attachments }) => {
      submitAssessment(kpiId, deptId, year, maturityLevel, evidence, attachments);
    });
  }, [submitAssessment]);

  // ─── Maturity Score Computations ───
  /** Component score = weighted average of KPI maturity levels */
  const getComponentScore = useCallback((componentId, deptId, year) => {
    const compKpis = allKpis.filter((k) => k.component_id === componentId && k.is_applicable);
    if (!compKpis.length) return 0;
    let totalWeighted = 0, totalWeight = 0;
    compKpis.forEach((kpi) => {
      const assessment = selfAssessments.find((a) => a.kpi_id === kpi.id && a.department_id === deptId && a.fiscal_year === year);
      if (assessment) {
        totalWeighted += assessment.maturity_level * kpi.weight;
        totalWeight += kpi.weight;
      }
    });
    return totalWeight > 0 ? +(totalWeighted / totalWeight).toFixed(2) : 0;
  }, [allKpis, selfAssessments]);

  /** Pillar score = average of component scores */
  const getPillarScore = useCallback((pillarId, deptId, year) => {
    const pillar = pillars.find((p) => p.id === pillarId);
    if (!pillar) return 0;
    const scores = pillar.components.map((c) => getComponentScore(c.id, deptId, year));
    const valid = scores.filter((s) => s > 0);
    return valid.length ? +(valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : 0;
  }, [pillars, getComponentScore]);

  /** Organization score = average of 5 pillar scores */
  const getOrgScore = useCallback((deptId, year) => {
    const scores = pillars.map((p) => getPillarScore(p.id, deptId, year));
    const valid = scores.filter((s) => s > 0);
    return valid.length ? +(valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : 0;
  }, [pillars, getPillarScore]);

  /** All pillar scores in one call */
  const getAllPillarScores = useCallback((deptId, year) => {
    return pillars.map((p) => ({
      pillar: p,
      score: getPillarScore(p.id, deptId, year),
      components: p.components.map((c) => ({
        component: c,
        score: getComponentScore(c.id, deptId, year),
      })),
    }));
  }, [pillars, getPillarScore, getComponentScore]);

  // ─── Gap Analysis ───
  const getGapAnalysis = useCallback((deptId, year, targetLevel = 5) => {
    return pillars.map((pillar) => ({
      pillar,
      components: pillar.components.map((comp) => {
        const score = getComponentScore(comp.id, deptId, year);
        const gap = Math.max(0, targetLevel - score);
        let priority = "low";
        if (gap >= 3) priority = "critical";
        else if (gap >= 2) priority = "high";
        else if (gap >= 1) priority = "medium";

        // Generate recommendation
        let recommendation = "";
        if (gap >= 3) recommendation = `يتطلب تدخل عاجل — الفجوة ${gap.toFixed(1)} مستوى. يوصى ببناء برنامج تأسيسي شامل.`;
        else if (gap >= 2) recommendation = `فجوة كبيرة (${gap.toFixed(1)} مستوى). يوصى بتطوير خطة تحسين مرحلية.`;
        else if (gap >= 1) recommendation = `فجوة متوسطة (${gap.toFixed(1)} مستوى). يوصى بتعزيز الممارسات الحالية.`;
        else recommendation = "المستوى يلبي أو يتجاوز المستهدف. يوصى بالحفاظ والتحسين المستمر.";

        return { component: comp, currentScore: score, targetLevel, gap: +gap.toFixed(2), priority, recommendation };
      }),
    }));
  }, [pillars, getComponentScore]);

  // ─── Getters ───
  const getKpisForComponent = useCallback((componentId) => allKpis.filter((k) => k.component_id === componentId), [allKpis]);
  const getAssessmentForKpi = useCallback((kpiId, deptId, year) => selfAssessments.find((a) => a.kpi_id === kpiId && a.department_id === deptId && a.fiscal_year === year), [selfAssessments]);

  return (
    <SumoodContext.Provider value={{
      // Data
      pillars, allKpis, selfAssessments, MATURITY_LEVELS,
      // Actions
      submitAssessment, batchSubmit,
      // Computations
      getComponentScore, getPillarScore, getOrgScore, getAllPillarScores, getGapAnalysis,
      // Getters
      getKpisForComponent, getAssessmentForKpi,
    }}>
      {children}
    </SumoodContext.Provider>
  );
}

export function useSumood() {
  const ctx = useContext(SumoodContext);
  if (!ctx) throw new Error("useSumood must be used within SumoodProvider");
  return ctx;
}

export default SumoodContext;
