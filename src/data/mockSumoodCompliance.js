// ─── Mock Sumood Document Compliance Data ────────────────────────────────────
// Used when backend or AI service is unavailable (demo / development mode)

export const mockDocumentMappings = {
  'doc-001': [
    // P1 – Risk Management
    { kpi_id: 'KPI-001', kpi_code: 'RM-01-001', kpi_text_ar: 'وجود سياسة معتمدة لإدارة المخاطر المؤسسية', pillar_id: 'P1', pillar_name: 'إدارة المخاطر', component_name: 'حوكمة المخاطر المؤسسية', compliance_level: 'FULLY_MET', suggested_maturity_level: 6, confidence_score: 0.95, evidence_quote: 'تم اعتماد سياسة إدارة المخاطر المؤسسية من قبل مجلس الإدارة في اجتماعه رقم 45 بتاريخ 2026/01/15', evidence_page_number: 3, evidence_section: 'الفصل الأول: الإطار العام', reasoning_ar: 'المستند يحتوي على سياسة معتمدة وموثقة بشكل رسمي مع توقيعات الاعتماد', reasoning_en: 'Document contains a formally approved and documented policy with approval signatures', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
    { kpi_id: 'KPI-002', kpi_code: 'RM-01-002', kpi_text_ar: 'تحديد أدوار ومسؤوليات إدارة المخاطر', pillar_id: 'P1', pillar_name: 'إدارة المخاطر', component_name: 'حوكمة المخاطر المؤسسية', compliance_level: 'FULLY_MET', suggested_maturity_level: 5, confidence_score: 0.92, evidence_quote: 'يتولى قسم إدارة المخاطر المؤسسية مسؤولية تنسيق وإدارة إطار عمل المخاطر', evidence_page_number: 5, evidence_section: 'الفصل الثاني: الأدوار والمسؤوليات', reasoning_ar: 'تحديد واضح للأدوار مع مصفوفة RACI', reasoning_en: 'Clear role definition with RACI matrix included', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
    { kpi_id: 'KPI-003', kpi_code: 'RM-01-003', kpi_text_ar: 'وجود لجنة حوكمة مخاطر معتمدة', pillar_id: 'P1', pillar_name: 'إدارة المخاطر', component_name: 'حوكمة المخاطر المؤسسية', compliance_level: 'PARTIALLY_MET', suggested_maturity_level: 4, confidence_score: 0.78, evidence_quote: 'تجتمع لجنة المخاطر بشكل ربعي لمراجعة سجل المخاطر', evidence_page_number: 7, evidence_section: 'الفصل الثالث: هيكل الحوكمة', reasoning_ar: 'اللجنة موجودة لكن لم يُذكر ميثاق اللجنة أو صلاحياتها بشكل مفصل', reasoning_en: 'Committee exists but charter and authorities not detailed', identified_gaps_ar: 'لا يوجد ميثاق مفصل للجنة يحدد صلاحياتها وآلية اتخاذ القرار', identified_gaps_en: 'No detailed committee charter defining authorities and decision-making mechanisms', improvement_suggestions: [{ suggestion_ar: 'إعداد ميثاق مفصل للجنة حوكمة المخاطر يحدد الصلاحيات والمسؤوليات', suggestion_en: 'Prepare a detailed risk governance committee charter', priority: 'HIGH' }] },
    { kpi_id: 'KPI-004', kpi_code: 'RM-01-004', kpi_text_ar: 'ربط سجل المخاطر بالأهداف الاستراتيجية', pillar_id: 'P1', pillar_name: 'إدارة المخاطر', component_name: 'حوكمة المخاطر المؤسسية', compliance_level: 'MENTIONED', suggested_maturity_level: 3, confidence_score: 0.65, evidence_quote: 'يجب أن تتوافق المخاطر المحددة مع الأهداف الاستراتيجية للمنظمة', evidence_page_number: 12, evidence_section: 'الفصل الرابع', reasoning_ar: 'ذُكر الربط بشكل عام دون آلية تنفيذية واضحة', reasoning_en: 'Integration mentioned generally without clear implementation methodology', identified_gaps_ar: 'لا توجد آلية واضحة لربط كل خطر بهدف استراتيجي محدد', identified_gaps_en: 'No clear mechanism to link each risk to specific strategic objective', improvement_suggestions: [{ suggestion_ar: 'تطوير مصفوفة ربط بين المخاطر والأهداف الاستراتيجية', suggestion_en: 'Develop a risk-to-strategic-objective mapping matrix', priority: 'MEDIUM' }] },
    { kpi_id: 'KPI-005', kpi_code: 'RM-01-005', kpi_text_ar: 'تحديث دوري لإطار الرغبة في المخاطر', pillar_id: 'P1', pillar_name: 'إدارة المخاطر', component_name: 'حوكمة المخاطر المؤسسية', compliance_level: 'NOT_ADDRESSED', suggested_maturity_level: 1, confidence_score: 0.88, evidence_quote: null, evidence_page_number: null, evidence_section: null, reasoning_ar: 'لم يُذكر إطار الرغبة في المخاطر في المستند', reasoning_en: 'Risk appetite framework not mentioned in the document', identified_gaps_ar: 'غياب كامل لإطار الرغبة في المخاطر وحدود التحمل', identified_gaps_en: 'Complete absence of risk appetite framework and tolerance levels', improvement_suggestions: [{ suggestion_ar: 'تطوير إطار شامل للرغبة في المخاطر يتضمن حدود التحمل لكل فئة', suggestion_en: 'Develop comprehensive risk appetite framework with tolerance limits per category', priority: 'HIGH' }] },
    // P2 – Emergency & Crisis
    { kpi_id: 'KPI-023', kpi_code: 'EC-01-001', kpi_text_ar: 'وجود خطة طوارئ شاملة ومعتمدة', pillar_id: 'P2', pillar_name: 'إدارة الطوارئ والأزمات', component_name: 'التخطيط والاستعداد للطوارئ', compliance_level: 'PARTIALLY_MET', suggested_maturity_level: 4, confidence_score: 0.72, evidence_quote: 'تتضمن السياسة إشارة إلى ضرورة وجود خطط طوارئ لكل إدارة', evidence_page_number: 18, evidence_section: 'الملحق أ', reasoning_ar: 'إشارة عامة دون خطة تفصيلية ضمن هذا المستند', reasoning_en: 'General reference without detailed plan within this document', identified_gaps_ar: 'خطة الطوارئ غير مضمنة كمستند مستقل مع هذه السياسة', identified_gaps_en: 'Emergency plan not included as standalone document', improvement_suggestions: [{ suggestion_ar: 'إعداد خطة طوارئ تفصيلية منفصلة ومرتبطة بالسياسة', suggestion_en: 'Create detailed standalone emergency plan linked to this policy', priority: 'HIGH' }] },
    { kpi_id: 'KPI-024', kpi_code: 'EC-01-002', kpi_text_ar: 'تحديد سيناريوهات الطوارئ المحتملة', pillar_id: 'P2', pillar_name: 'إدارة الطوارئ والأزمات', component_name: 'التخطيط والاستعداد للطوارئ', compliance_level: 'NOT_ADDRESSED', suggested_maturity_level: 1, confidence_score: 0.90, evidence_quote: null, evidence_page_number: null, evidence_section: null, reasoning_ar: 'لا يتناول المستند سيناريوهات الطوارئ', reasoning_en: 'Document does not address emergency scenarios', identified_gaps_ar: 'عدم تحديد سيناريوهات الطوارئ المحتملة', identified_gaps_en: 'Emergency scenarios not identified', improvement_suggestions: [{ suggestion_ar: 'تطوير قائمة بسيناريوهات الطوارئ المحتملة مع تحليل السيناريو', suggestion_en: 'Develop list of potential emergency scenarios with scenario analysis', priority: 'MEDIUM' }] },
    // P3 – Business Continuity
    { kpi_id: 'KPI-045', kpi_code: 'BC-01-001', kpi_text_ar: 'تنفيذ تحليل تأثير أعمال شامل', pillar_id: 'P3', pillar_name: 'استمرارية الأعمال', component_name: 'تحليل تأثير الأعمال (BIA)', compliance_level: 'MENTIONED', suggested_maturity_level: 2, confidence_score: 0.60, evidence_quote: 'يشمل إطار المخاطر ضرورة إجراء تحليل أثر الأعمال', evidence_page_number: 20, evidence_section: 'الفصل السادس', reasoning_ar: 'ذُكر BIA كمتطلب دون تفاصيل تنفيذية', reasoning_en: 'BIA mentioned as requirement without implementation details', identified_gaps_ar: 'لا يوجد منهجية واضحة لتنفيذ BIA', identified_gaps_en: 'No clear BIA implementation methodology', improvement_suggestions: [{ suggestion_ar: 'تطوير منهجية BIA مفصلة مع نماذج التقييم', suggestion_en: 'Develop detailed BIA methodology with assessment templates', priority: 'HIGH' }] },
    // P4 – ICT
    { kpi_id: 'KPI-067', kpi_code: 'IT-01-001', kpi_text_ar: 'خطة تعافي تقنية معتمدة من الكوارث (DRP)', pillar_id: 'P4', pillar_name: 'إدارة تقنية المعلومات والاتصالات', component_name: 'البنية التحتية والتعافي من الكوارث', compliance_level: 'NOT_ADDRESSED', suggested_maturity_level: 1, confidence_score: 0.92, evidence_quote: null, evidence_page_number: null, evidence_section: null, reasoning_ar: 'لا يغطي المستند خطط التعافي التقني', reasoning_en: 'Document does not cover IT disaster recovery plans', identified_gaps_ar: 'غياب خطة تعافي تقنية DRP', identified_gaps_en: 'IT DRP not addressed', improvement_suggestions: [{ suggestion_ar: 'إعداد خطة تعافي تقنية شاملة', suggestion_en: 'Prepare comprehensive IT disaster recovery plan', priority: 'HIGH' }] },
    // P5 – Organizational Capabilities
    { kpi_id: 'KPI-091', kpi_code: 'OC-01-001', kpi_text_ar: 'التزام الإدارة العليا بالصمود المؤسسي', pillar_id: 'P5', pillar_name: 'القدرات المؤسسية والثقافة', component_name: 'القيادة والحوكمة', compliance_level: 'FULLY_MET', suggested_maturity_level: 6, confidence_score: 0.94, evidence_quote: 'يؤكد مجلس الإدارة التزامه التام بتعزيز ثقافة الصمود المؤسسي', evidence_page_number: 2, evidence_section: 'رسالة الرئيس التنفيذي', reasoning_ar: 'التزام واضح ومكتوب من الإدارة العليا', reasoning_en: 'Clear written commitment from senior management', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
  ],
};

export const mockSumoodDocuments = [
  {
    id: 'doc-001',
    file_name: 'سياسة إدارة المخاطر المؤسسية 2026.pdf',
    file_type: 'application/pdf',
    file_size_bytes: 2456789,
    document_type: 'POLICY',
    document_type_ar: 'سياسة',
    status: 'ANALYZED',
    total_pages: 42,
    ai_model: 'claude-sonnet-4-20250514',
    created_at: '2026-04-01T10:00:00',
    analyzed_at: '2026-04-01T10:12:00',
    uploaded_by_name: 'م. خالد الغفيلي',
    document_summary_ar: 'سياسة شاملة لإدارة المخاطر المؤسسية تتضمن الأطر والإجراءات والمسؤوليات. تغطي حوكمة المخاطر وتقييمها ومعالجتها مع إشارات لاستمرارية الأعمال.',
    document_summary_en: 'Comprehensive enterprise risk management policy covering frameworks, procedures, and responsibilities. Addresses risk governance, assessment, and treatment with references to business continuity.',
    summary: {
      total_kpis_assessed: 43,
      kpis_fully_met: 18,
      kpis_partially_met: 12,
      kpis_mentioned: 5,
      kpis_not_addressed: 8,
      avg_maturity_level: 4.2,
      pillar_coverage: { P1: 82, P2: 35, P3: 28, P4: 15, P5: 65 },
      executive_summary_ar: 'يغطي المستند بشكل شامل محور إدارة المخاطر بنسبة 82% مع نقاط قوة في حوكمة المخاطر وتحديد الأدوار. أبرز الفجوات في محوري تقنية المعلومات (15%) واستمرارية الأعمال (28%) حيث يُذكران بشكل عابر. يُوصى بتطوير مستندات تكميلية لمحاور التعافي التقني وإدارة الطوارئ لتحقيق تغطية شاملة لمؤشر صمود.',
      executive_summary_en: 'The document comprehensively covers the Risk Management pillar at 82% with strengths in risk governance and role definition. Key gaps exist in ICT Management (15%) and Business Continuity (28%) pillars which are only briefly mentioned. Complementary documents for IT recovery and emergency management are recommended for full Sumood coverage.',
    },
  },
  {
    id: 'doc-002',
    file_name: 'خطة استمرارية الأعمال 2026.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size_bytes: 1876543,
    document_type: 'PLAN',
    document_type_ar: 'خطة',
    status: 'ANALYZED',
    total_pages: 67,
    ai_model: 'claude-sonnet-4-20250514',
    created_at: '2026-03-28T14:30:00',
    analyzed_at: '2026-03-28T14:48:00',
    uploaded_by_name: 'م. سعد الحربي',
    document_summary_ar: 'خطة استمرارية أعمال محدثة تتضمن تحليل أثر الأعمال وخطط التعافي من الكوارث. تغطي 15 عملية حيوية مع أهداف زمنية واضحة للاستجابة والتعافي.',
    document_summary_en: 'Updated business continuity plan including BIA and disaster recovery plans. Covers 15 critical processes with clear RTO/RPO targets.',
    summary: {
      total_kpis_assessed: 48,
      kpis_fully_met: 22,
      kpis_partially_met: 14,
      kpis_mentioned: 8,
      kpis_not_addressed: 4,
      avg_maturity_level: 4.8,
      pillar_coverage: { P1: 45, P2: 72, P3: 92, P4: 55, P5: 38 },
      executive_summary_ar: 'خطة استمرارية أعمال متميزة تغطي 92% من محور استمرارية الأعمال مع تفوق في تحليل أثر الأعمال واستراتيجيات الاستمرارية. تشمل أيضاً تغطية جيدة لإدارة الطوارئ (72%). يُوصى بتعزيز الجوانب المتعلقة بالقدرات المؤسسية والتدريب.',
      executive_summary_en: 'Excellent BCP covering 92% of the Business Continuity pillar with strong BIA and continuity strategies. Good Emergency Management coverage (72%). Strengthening organizational capabilities and training sections is recommended.',
    },
  },
  {
    id: 'doc-003',
    file_name: 'إجراءات الاستجابة للحوادث السيبرانية v3.pdf',
    file_type: 'application/pdf',
    file_size_bytes: 987654,
    document_type: 'PROCEDURE',
    document_type_ar: 'إجراء',
    status: 'ANALYZING',
    total_pages: null,
    ai_model: null,
    created_at: '2026-04-13T09:15:00',
    analyzed_at: null,
    uploaded_by_name: 'م. خالد الغفيلي',
    document_summary_ar: null,
    document_summary_en: null,
    summary: null,
  },
];

// Generate mock mappings for doc-002 (BCP document)
export const mockDocumentMappingsDoc002 = [
  { kpi_id: 'KPI-045', kpi_code: 'BC-01-001', kpi_text_ar: 'تنفيذ تحليل تأثير أعمال شامل', pillar_id: 'P3', pillar_name: 'استمرارية الأعمال', component_name: 'تحليل تأثير الأعمال (BIA)', compliance_level: 'FULLY_MET', suggested_maturity_level: 6, confidence_score: 0.97, evidence_quote: 'تم تنفيذ تحليل أثر الأعمال لجميع العمليات الحيوية البالغ عددها 15 عملية', evidence_page_number: 8, evidence_section: 'الفصل الثاني: تحليل أثر الأعمال', reasoning_ar: 'تحليل أثر أعمال شامل ومفصل مع جميع العناصر المطلوبة', reasoning_en: 'Comprehensive BIA with all required elements', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
  { kpi_id: 'KPI-046', kpi_code: 'BC-01-002', kpi_text_ar: 'تحديد MTPD و RTO و RPO لكل عملية', pillar_id: 'P3', pillar_name: 'استمرارية الأعمال', component_name: 'تحليل تأثير الأعمال (BIA)', compliance_level: 'FULLY_MET', suggested_maturity_level: 6, confidence_score: 0.96, evidence_quote: 'MTPD: 4 ساعات، RTO: 2 ساعة، RPO: 1 ساعة للخدمات المصرفية الأساسية', evidence_page_number: 12, evidence_section: 'جدول 2.1: الأهداف الزمنية', reasoning_ar: 'تحديد واضح ودقيق لجميع الأهداف الزمنية لكل عملية', reasoning_en: 'Clear and precise time objectives for all processes', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
  { kpi_id: 'KPI-023', kpi_code: 'EC-01-001', kpi_text_ar: 'وجود خطة طوارئ شاملة ومعتمدة', pillar_id: 'P2', pillar_name: 'إدارة الطوارئ والأزمات', component_name: 'التخطيط والاستعداد للطوارئ', compliance_level: 'FULLY_MET', suggested_maturity_level: 5, confidence_score: 0.88, evidence_quote: 'تتضمن الخطة إجراءات الطوارئ الفورية وبروتوكولات الإبلاغ والتصعيد', evidence_page_number: 25, evidence_section: 'الفصل الرابع: إجراءات الطوارئ', reasoning_ar: 'خطة طوارئ متكاملة ضمن خطة الاستمرارية', reasoning_en: 'Integrated emergency plan within continuity plan', identified_gaps_ar: null, identified_gaps_en: null, improvement_suggestions: [] },
];

export function getMockMappingsForDocument(docId) {
  if (docId === 'doc-001') return mockDocumentMappings['doc-001'];
  if (docId === 'doc-002') return mockDocumentMappingsDoc002;
  return [];
}
