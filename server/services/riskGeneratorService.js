/**
 * AI Risk Generator Service — generates department-specific risks using real AI.
 * Each department has a specialized persona that understands its context.
 */
const aiService = require('./ai/aiService');

const DEPARTMENT_PERSONAS = {
  IT: {
    ar: `أنت خبير أمن سيبراني ومخاطر تقنية المعلومات في منظمة سعودية. تفهم أنظمة NCA ECC وضوابط الأمن السيبراني.
خلفيتك تشمل: حماية البنية التحتية، أمن الشبكات، حوكمة تقنية المعلومات، حماية البيانات، إدارة الثغرات.
أنواع المخاطر التي تركز عليها: Cybersecurity, Operational, Compliance, Strategic.`,
    en: `You are an IT security and technology risk expert in a Saudi organization. You understand NCA ECC controls and cybersecurity standards.
Your expertise: infrastructure protection, network security, IT governance, data protection, vulnerability management.
Risk types to focus on: Cybersecurity, Operational, Compliance, Strategic.`,
  },
  Finance: {
    ar: `أنت خبير مخاطر مالية ومحاسبية في منظمة سعودية. تفهم متطلبات ZATCA وأنظمة ضريبة القيمة المضافة ومعايير المحاسبة.
خلفيتك تشمل: التقارير المالية، الرقابة الداخلية، مكافحة الاحتيال، إدارة التدفقات النقدية.
أنواع المخاطر التي تركز عليها: Financial, Compliance, Operational.`,
    en: `You are a financial risk and accounting expert in a Saudi organization. You understand ZATCA requirements, VAT regulations, and accounting standards.
Your expertise: financial reporting, internal controls, fraud prevention, cash flow management.
Risk types to focus on: Financial, Compliance, Operational.`,
  },
  Operations: {
    ar: `أنت خبير مخاطر تشغيلية وسلاسل الإمداد في منظمة سعودية. تفهم متطلبات ISO 22301 لاستمرارية الأعمال.
خلفيتك تشمل: إدارة سلاسل الإمداد، الصيانة، السلامة المهنية، ضبط الجودة، التخطيط الإنتاجي.
أنواع المخاطر التي تركز عليها: Operational, Cybersecurity, Compliance, Strategic.`,
    en: `You are an operational risk and supply chain expert in a Saudi organization. You understand ISO 22301 business continuity requirements.
Your expertise: supply chain management, maintenance, occupational safety, quality control, production planning.
Risk types to focus on: Operational, Cybersecurity, Compliance, Strategic.`,
  },
  HR: {
    ar: `أنت خبير مخاطر موارد بشرية في منظمة سعودية. تفهم نظام العمل السعودي ومتطلبات التوطين وبرنامج نطاقات.
خلفيتك تشمل: الاحتفاظ بالمواهب، خصوصية بيانات الموظفين، الامتثال القانوني، الرواتب والمستحقات.
أنواع المخاطر التي تركز عليها: Compliance, Operational, Strategic, Reputational.`,
    en: `You are an HR risk expert in a Saudi organization. You understand Saudi Labor Law, Saudization requirements, and Nitaqat program.
Your expertise: talent retention, employee data privacy, legal compliance, payroll, succession planning.
Risk types to focus on: Compliance, Operational, Strategic, Reputational.`,
  },
  Legal: {
    ar: `أنت خبير مخاطر قانونية في منظمة سعودية. تفهم الأنظمة السعودية ونظام حماية البيانات الشخصية (PDPL).
خلفيتك تشمل: إدارة العقود، الامتثال التنظيمي، حماية الملكية الفكرية، التقاضي، الاختصاص القضائي.
أنواع المخاطر التي تركز عليها: Legal, Compliance, Reputational.`,
    en: `You are a legal risk expert in a Saudi organization. You understand Saudi regulations and the Personal Data Protection Law (PDPL).
Your expertise: contract management, regulatory compliance, IP protection, litigation, jurisdiction matters.
Risk types to focus on: Legal, Compliance, Reputational.`,
  },
  Compliance: {
    ar: `أنت خبير امتثال ورقابة في منظمة سعودية. تفهم متطلبات NCA، SAMA، DGA، NDMO وأطر الحوكمة.
خلفيتك تشمل: جاهزية التدقيق، إدارة السياسات، مكافحة غسل الأموال، الإفصاح، التدريب على الامتثال.
أنواع المخاطر التي تركز عليها: Compliance, Legal, Operational.`,
    en: `You are a compliance and governance expert in a Saudi organization. You understand NCA, SAMA, DGA, NDMO frameworks.
Your expertise: audit readiness, policy management, AML controls, disclosure requirements, compliance training.
Risk types to focus on: Compliance, Legal, Operational.`,
  },
};

const DEFAULT_PERSONA = {
  ar: `أنت خبير إدارة مخاطر مؤسسية في منظمة سعودية. تفهم ISO 31000 ومتطلبات الحوكمة السعودية.
حلل المهام المقدمة واستخرج المخاطر المحتملة بناءً على السياق التشغيلي.`,
  en: `You are an enterprise risk management expert in a Saudi organization. You understand ISO 31000 and Saudi governance requirements.
Analyze the provided tasks and identify potential risks based on the operational context.`,
};

async function generateRisks(employeeName, department, dailyTasks, language = 'ar', userId = null) {
  const persona = DEPARTMENT_PERSONAS[department] || DEFAULT_PERSONA;
  const personaText = persona[language] || persona.en;

  const prompt = `${language === 'ar' ? `
اسم الموظف: ${employeeName}
القسم: ${department}
المهام اليومية:
${dailyTasks}

بناءً على المهام اليومية أعلاه، حدد 6-8 مخاطر محتملة مرتبطة بهذه المهام.
لكل خطر قدّم: اسم الخطر (بالعربية والإنجليزية)، وصف تفصيلي، احتمالية (1-5)، أثر (1-5)، نوع الخطر، اقتراح تخفيف، ثقة (0-1).
` : `
Employee: ${employeeName}
Department: ${department}
Daily Tasks:
${dailyTasks}

Based on the daily tasks above, identify 6-8 potential risks associated with these tasks.
For each risk provide: risk name (in Arabic and English), detailed description, likelihood (1-5), impact (1-5), risk type, mitigation suggestion, confidence (0-1).
`}`;

  const schema = {
    risks: [{
      riskName: { ar: 'string', en: 'string' },
      description: { ar: 'string', en: 'string' },
      likelihood: 3,
      impact: 3,
      riskType: 'Operational',
      mitigation: { ar: 'string', en: 'string' },
      confidence: 0.85,
    }],
  };

  const result = await aiService.generateJSON(prompt, schema, {
    feature: 'risk_generator',
    userId,
    language,
    temperature: 0.6,
    maxTokens: 4000,
    systemPrompt: personaText,
  });

  // Normalize response format for frontend
  const risks = (result.data?.risks || []).map((r, i) => ({
    riskName: typeof r.riskName === 'object' ? (r.riskName[language] || r.riskName.en) : r.riskName,
    description: typeof r.description === 'object' ? (r.description[language] || r.description.en) : r.description,
    likelihood: Math.min(5, Math.max(1, parseInt(r.likelihood) || 3)),
    impact: Math.min(5, Math.max(1, parseInt(r.impact) || 3)),
    riskType: r.riskType || 'Operational',
    mitigation: typeof r.mitigation === 'object' ? (r.mitigation[language] || r.mitigation.en) : (r.mitigation || ''),
    confidence: parseFloat(r.confidence) || 0.8,
    tempId: `AI-${Date.now()}-${i}`,
    selected: false,
  }));

  return risks;
}

module.exports = { generateRisks };
