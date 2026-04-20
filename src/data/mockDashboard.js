// ─── Executive Dashboard Mock Data ────────────────────────────────────────────
// Used for demo/development when backend is unavailable

export const mockDashboardData = {
  kpis: {
    riskScore: { value: 72, trend: -4, total: 120, catastrophic: 15, high: 11, medium: 35, low: 59, sparkline: [68, 70, 74, 72, 70, 72] },
    compliance: { value: 94, trend: 2, sumoodMaturity: 4.0, frameworksCompliant: 5, totalFrameworks: 6, sparkline: [89, 90, 91, 93, 94, 94] },
    thirdPartyExposures: { value: 12, trend: -2, criticalVendors: 12, expiringContracts30d: 4, underReview: 3 },
    activeAnomalies: { value: 5, trend: 1, critical: 3, high: 2, needsAction: true },
    activeIncidents: { value: 0, p1: 0, p2: 0, lastIncidentDaysAgo: 12, mttrThisMonth: 4.2 },
    ale: { value: 12500000, trend: -8, quantifiedRisks: 45, var95: 38000000 },
  },

  riskTrend: {
    ar: [
      { month: 'أكت', inherent: 88, residual: 71 },
      { month: 'نوف', inherent: 85, residual: 68 },
      { month: 'ديس', inherent: 91, residual: 74 },
      { month: 'يناير', inherent: 87, residual: 69 },
      { month: 'فبر', inherent: 82, residual: 65 },
      { month: 'مارس', inherent: 79, residual: 61 },
    ],
    en: [
      { month: 'Oct', inherent: 88, residual: 71 },
      { month: 'Nov', inherent: 85, residual: 68 },
      { month: 'Dec', inherent: 91, residual: 74 },
      { month: 'Jan', inherent: 87, residual: 69 },
      { month: 'Feb', inherent: 82, residual: 65 },
      { month: 'Mar', inherent: 79, residual: 61 },
    ],
  },

  riskMatrix: {
    5: { 5: { count: 1, ids: ['RSK-0001'] }, 4: { count: 2, ids: ['RSK-0774','RSK-1108'] }, 3: { count: 1, ids: ['RSK-0891'] }, 2: { count: 0, ids: [] }, 1: { count: 0, ids: [] } },
    4: { 5: { count: 3, ids: ['RSK-1042','RSK-0102','RSK-0301'] }, 4: { count: 5, ids: ['RSK-0455','RSK-0302','RSK-0120','RSK-0213','RSK-0512'] }, 3: { count: 4, ids: ['RSK-0611','RSK-0712','RSK-0340','RSK-0453'] }, 2: { count: 2, ids: ['RSK-0801','RSK-0824'] }, 1: { count: 1, ids: ['RSK-0910'] } },
    3: { 5: { count: 2, ids: ['RSK-0553','RSK-0620'] }, 4: { count: 6, ids: ['RSK-0311','RSK-0412','RSK-0520','RSK-0623','RSK-0731','RSK-0845'] }, 3: { count: 12, ids: ['RSK-0101','RSK-0202','RSK-0303','RSK-0404','RSK-0505','RSK-0606','RSK-0707','RSK-0808','RSK-0909','RSK-1010','RSK-1111','RSK-1212'] }, 2: { count: 8, ids: ['RSK-0901','RSK-0902','RSK-0903','RSK-0904','RSK-0905','RSK-0906','RSK-0907','RSK-0908'] }, 1: { count: 3, ids: ['RSK-1301','RSK-1302','RSK-1303'] } },
    2: { 5: { count: 1, ids: ['RSK-1401'] }, 4: { count: 3, ids: ['RSK-1501','RSK-1502','RSK-1503'] }, 3: { count: 7, ids: ['RSK-1601','RSK-1602','RSK-1603','RSK-1604','RSK-1605','RSK-1606','RSK-1607'] }, 2: { count: 14, ids: ['RSK-1701','RSK-1702','RSK-1703','RSK-1704','RSK-1705','RSK-1706','RSK-1707','RSK-1708','RSK-1709','RSK-1710','RSK-1711','RSK-1712','RSK-1713','RSK-1714'] }, 1: { count: 10, ids: ['RSK-1801','RSK-1802','RSK-1803','RSK-1804','RSK-1805','RSK-1806','RSK-1807','RSK-1808','RSK-1809','RSK-1810'] } },
    1: { 5: { count: 0, ids: [] }, 4: { count: 1, ids: ['RSK-1901'] }, 3: { count: 4, ids: ['RSK-2001','RSK-2002','RSK-2003','RSK-2004'] }, 2: { count: 8, ids: ['RSK-2101','RSK-2102','RSK-2103','RSK-2104','RSK-2105','RSK-2106','RSK-2107','RSK-2108'] }, 1: { count: 22, ids: ['RSK-2201','RSK-2202','RSK-2203','RSK-2204','RSK-2205','RSK-2206','RSK-2207','RSK-2208','RSK-2209','RSK-2210','RSK-2211','RSK-2212','RSK-2213','RSK-2214','RSK-2215','RSK-2216','RSK-2217','RSK-2218','RSK-2219','RSK-2220','RSK-2221','RSK-2222'] } },
  },

  aiInsights: [
    {
      id: 'ai-001', severity: 'critical', type: 'SUPPLY_CHAIN',
      title: { ar: 'تعطّل سلسلة الإمداد — آسيا باسيفيك', en: 'Supply Chain Disruption — Asia Pacific' },
      description: {
        ar: 'نمذجة التوترات الجيوسياسية (مضيق تايوان) تشير لاحتمال 85٪ لفشل مورد من الطبقة الثانية خلال 21 يوماً. فعّل بروتوكول البديل الفوري.',
        en: 'Geopolitical tension modeling (Taiwan Strait) indicates 85% probability of Tier-2 supplier failure within 21 days. Activate alternative supplier protocol.',
      },
      affectedEntity: { ar: 'آسيا-باسيفيك', en: 'Asia-Pacific' },
      actionLabel: { ar: 'محاكاة التأثير', en: 'Simulate Impact' },
      tags: { ar: ['احتمالية: 85%', 'آسيا-باسيفيك', 'موردون الطبقة 2'], en: ['Probability: 85%', 'Asia-Pacific', 'Tier-2 Suppliers'] },
    },
    {
      id: 'ai-002', severity: 'warning', type: 'COMPLIANCE_DRIFT',
      title: { ar: 'انحراف امتثال ISO 22301 — العمليات الأوروبية', en: 'ISO 22301 Compliance Drift — EU Operations' },
      description: {
        ar: 'مراجعة سياسة BCM متأخرة 47 يوماً في الفروع الأوروبية. محرك التدقيق اكتشف 3 انحرافات في وثائق BCP.',
        en: 'BCM policy review is 47 days overdue at EU branches. Audit engine detected 3 deviations in BCP documentation.',
      },
      affectedEntity: { ar: 'العمليات الأوروبية', en: 'EU Operations' },
      actionLabel: { ar: 'عرض تحليل الفجوة', en: 'View Gap Analysis' },
      tags: { ar: ['ISO 22301', 'عمليات EU', 'فجوة سياسات'], en: ['ISO 22301', 'EU Ops', 'Policy Gap'] },
    },
    {
      id: 'ai-003', severity: 'info', type: 'THREAT_INTEL',
      title: { ar: 'تحديث ذكاء برامج الفدية عبر NLP', en: 'Ransomware Intelligence Update via NLP' },
      description: {
        ar: 'استوعب النظام 14 مجموعة IOC جديدة من ISAC. قواعد WAF السحابية مُحدّثة تلقائياً. تعيين MITRE ATT&CK: TA0040 • T1486 مكتمل.',
        en: 'System ingested 14 new IOC clusters from ISAC. Cloud WAF rules auto-updated. MITRE ATT&CK mapping: TA0040 • T1486 complete.',
      },
      affectedEntity: { ar: 'الأمن السيبراني', en: 'Cybersecurity' },
      actionLabel: { ar: 'عرض ملخص التهديد', en: 'View Threat Summary' },
      tags: { ar: ['ذكاء آلي', 'MITRE ATT&CK', 'بدون تدخل بشري'], en: ['Auto-Intel', 'MITRE ATT&CK', 'Zero-Touch'] },
    },
  ],

  complianceFrameworks: [
    { id: 'iso22301', name: { ar: 'ISO 22301', en: 'ISO 22301' }, percentage: 96, status: 'COMPLIANT', color: '#10b981' },
    { id: 'sama', name: { ar: 'سما (SAMA)', en: 'SAMA' }, percentage: 91, status: 'COMPLIANT', color: '#06b6d4' },
    { id: 'soc2', name: { ar: 'SOC 2', en: 'SOC 2' }, percentage: 94, status: 'COMPLIANT', color: '#f59e0b' },
    { id: 'gdpr', name: { ar: 'GDPR', en: 'GDPR' }, percentage: 88, status: 'NEAR_LIMIT', color: '#3b82f6' },
    { id: 'dpdp', name: { ar: 'DPDP', en: 'DPDP' }, percentage: 83, status: 'NEAR_LIMIT', color: '#8b5cf6' },
    { id: 'sumood', name: { ar: 'مؤشر صمود', en: 'Sumood Index' }, percentage: 57, status: 'NEEDS_ACTION', color: '#f97316' },
  ],

  operationalResilience: {
    overallIndex: 7.8,
    bia: { criticalProcesses: 50, approvedCycles: 5, pendingCycles: 1, shortestRTO: 2 },
    vendors: { criticalCount: 12, needsReview: 4, avgRiskScore: 3.4, expiringContracts: 4 },
    sumood: { maturityLevel: 4.0, kpisAssessed: 113, lowestPillar: 'BC', lowestPillarName: { ar: 'استمرارية الأعمال', en: 'Business Continuity' }, lowestScore: 3.9, trend: 0.3 },
  },

  incidentCommand: {
    activeCount: 0,
    activeIncidents: [],
    lastIncidentDaysAgo: 12,
    mttrHours: 4.2,
    resolvedThisMonth: 3,
    recentResolved: [
      { id: 'INC-0048', title: { ar: 'انقطاع خادم API', en: 'API Server Outage' }, resolvedAt: '2026-04-01', severity: 'P2' },
      { id: 'INC-0047', title: { ar: 'محاولة تصيد إلكتروني', en: 'Phishing Attempt' }, resolvedAt: '2026-03-28', severity: 'P3' },
      { id: 'INC-0046', title: { ar: 'خرق وصول غير مصرح', en: 'Unauthorized Access Breach' }, resolvedAt: '2026-03-25', severity: 'P1' },
      { id: 'INC-0045', title: { ar: 'فشل نظام النسخ الاحتياطي', en: 'Backup System Failure' }, resolvedAt: '2026-03-20', severity: 'P2' },
      { id: 'INC-0044', title: { ar: 'تسرب بيانات جزئي', en: 'Partial Data Leak' }, resolvedAt: '2026-03-15', severity: 'P2' },
    ],
  },

  riskLifecycleFunnel: [
    { stage: 'IDENTIFIED', label: { ar: 'تم التحديد', en: 'Identified' }, count: 120, pct: 100, avgDays: 2, color: '#06b6d4' },
    { stage: 'IN_PROGRESS', label: { ar: 'قيد المعالجة', en: 'In Progress' }, count: 72, pct: 60, avgDays: 12, color: '#3b82f6' },
    { stage: 'MONITORED', label: { ar: 'تحت المراقبة', en: 'Monitored' }, count: 45, pct: 37.5, avgDays: 45, color: '#f59e0b' },
    { stage: 'SIMULATION', label: { ar: 'خاضع للمحاكاة', en: 'Simulated' }, count: 18, pct: 15, avgDays: 8, color: '#8b5cf6' },
    { stage: 'CLOSED', label: { ar: 'مغلق / محلول', en: 'Closed' }, count: 28, pct: 23.3, avgDays: null, color: '#10b981' },
    { stage: 'ESCALATED', label: { ar: 'تم التصعيد', en: 'Escalated' }, count: 14, pct: 11.7, avgDays: 25, color: '#ef4444' },
  ],

  regulatoryCalendar: [
    { id: 'reg-001', body: 'NCA', title: { ar: 'تحديث إطار الأمن السيبراني الوطني v3.2', en: 'National Cybersecurity Framework Update v3.2' }, daysRemaining: 5, deadline: '2026-04-18', openActionItems: 3, severity: 'HIGH' },
    { id: 'reg-002', body: 'SAMA', title: { ar: 'تقرير الامتثال الربعي Q1-2026', en: 'Quarterly Compliance Report Q1-2026' }, daysRemaining: 12, deadline: '2026-04-25', openActionItems: 2, severity: 'HIGH' },
    { id: 'reg-003', body: 'NDMO', title: { ar: 'تقييم نضج حوكمة البيانات السنوي', en: 'Annual Data Governance Maturity Assessment' }, daysRemaining: 28, deadline: '2026-05-11', openActionItems: 5, severity: 'MEDIUM' },
    { id: 'reg-004', body: 'SDAIA', title: { ar: 'مراجعة سياسة حماية البيانات الشخصية', en: 'Personal Data Protection Policy Review' }, daysRemaining: 45, deadline: '2026-05-28', openActionItems: 1, severity: 'MEDIUM' },
    { id: 'reg-005', body: 'CMA', title: { ar: 'الإفصاح عن مخاطر ESG — التقرير السنوي', en: 'ESG Risk Disclosure — Annual Report' }, daysRemaining: 72, deadline: '2026-06-24', openActionItems: 4, severity: 'LOW' },
  ],
};
