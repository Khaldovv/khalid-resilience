const bcrypt = require('bcryptjs');

/**
 * Seed: Initial data for all tables
 */
exports.seed = async function (knex) {
  // ── Clear existing data (reverse FK order) ─────────────────────────────────
  // audit_log has an immutability trigger — TRUNCATE bypasses triggers
  try { await knex.raw('TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE'); } catch { /* ignore if table doesn't exist */ }
  await knex('sumood_assessments').del();
  await knex('sumood_kpis').del();
  await knex('sumood_components').del();
  await knex('sumood_pillars').del();
  await knex('bia_workflow_steps').del();
  await knex('bia_risk_links').del();
  await knex('bia_recovery_strategies').del();
  await knex('bia_dependencies').del();
  await knex('bia_impact_ratings').del();
  await knex('bia_processes').del();
  await knex('bia_assessments').del();
  await knex('risk_audit_trail').del();
  await knex('risk_treatments').del();
  await knex('risks').del();
  await knex.raw('UPDATE departments SET head_user_id = NULL');
  await knex('users').del();
  await knex('departments').del();

  // ── Departments ────────────────────────────────────────────────────────────
  const deptIT  = 'f0e1d2c3-b4a5-6789-0123-456789abcdef';
  const deptFin = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const deptOps = 'b2c3d4e5-f6a7-8901-2345-678901abcdef';

  await knex('departments').insert([
    { id: deptIT,  name_ar: 'تقنية المعلومات', name_en: 'Information Technology' },
    { id: deptFin, name_ar: 'الإدارة المالية', name_en: 'Finance' },
    { id: deptOps, name_ar: 'العمليات',       name_en: 'Operations' },
  ]);

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Admin@2026', 12);

  const adminId = '11111111-1111-1111-1111-111111111111';
  const croId   = '22222222-2222-2222-2222-222222222222';
  const cisoId  = '33333333-3333-3333-3333-333333333333';
  const deptHeadId = '44444444-4444-4444-4444-444444444444';
  const bcCoordId  = '55555555-5555-5555-5555-555555555555';
  const analystId  = '66666666-6666-6666-6666-666666666666';

  await knex('users').insert([
    { id: adminId, email: 'admin@grc.sa', password_hash: hash, full_name_ar: 'مدير النظام', full_name_en: 'System Admin', role: 'ADMIN', department_id: deptIT, permissions: JSON.stringify(['*']) },
    { id: croId, email: 'cro@grc.sa', password_hash: hash, full_name_ar: 'رئيس إدارة المخاطر', full_name_en: 'Chief Risk Officer', role: 'CRO', department_id: deptIT, permissions: JSON.stringify(['MANAGE_RISKS','VIEW_RISKS','MANAGE_BIA','VIEW_BIA','MANAGE_SUMOOD','VIEW_SUMOOD','VIEW_REPORTS','EXPORT_REPORTS']) },
    { id: cisoId, email: 'ciso@grc.sa', password_hash: hash, full_name_ar: 'رئيس أمن المعلومات', full_name_en: 'CISO', role: 'CISO', department_id: deptIT, permissions: JSON.stringify(['VIEW_RISKS','APPROVE_BIA','MANAGE_BIA','VIEW_BIA','VIEW_SUMOOD','VIEW_REPORTS']) },
    { id: deptHeadId, email: 'depthead@grc.sa', password_hash: hash, full_name_ar: 'م. خالد الغفيلي', full_name_en: 'Eng. Khalid Al-Ghafili', role: 'DEPT_HEAD', department_id: deptIT, permissions: JSON.stringify(['MANAGE_RISKS','VIEW_RISKS','MANAGE_BIA','VIEW_BIA','MANAGE_SUMOOD','VIEW_SUMOOD','APPROVE_BIA']) },
    { id: bcCoordId, email: 'bc@grc.sa', password_hash: hash, full_name_ar: 'أ. فاطمة الشهراني', full_name_en: 'Fatima Al-Shahrani', role: 'BC_COORDINATOR', department_id: deptIT, permissions: JSON.stringify(['MANAGE_BIA','VIEW_BIA','APPROVE_BIA','VIEW_RISKS','VIEW_SUMOOD','VIEW_REPORTS','EXPORT_REPORTS']) },
    { id: analystId, email: 'analyst@grc.sa', password_hash: hash, full_name_ar: 'أ. محمد الدوسري', full_name_en: 'Mohammed Al-Dosari', role: 'ANALYST', department_id: deptOps, permissions: JSON.stringify(['MANAGE_RISKS','VIEW_RISKS','VIEW_BIA','MANAGE_SUMOOD','VIEW_SUMOOD']) },
  ]);

  // ── Risks ──────────────────────────────────────────────────────────────────
  await knex('risks').insert([
    { id: 'RSK-1042', department_id: deptIT, risk_name: 'Legacy API Data Exfiltration', description: 'Potential data exfiltration via legacy third-party API endpoint', risk_type: 'Cybersecurity', inherent_likelihood: 5, inherent_impact: 5, inherent_score: 25, inherent_level: 'Catastrophic', residual_likelihood: 3, residual_impact: 5, residual_score: 15, residual_level: 'High', confidence_level: 4, risk_owner_id: cisoId, response_type: 'MITIGATE', lifecycle_status: 'IN_PROGRESS', created_by: croId },
    { id: 'RSK-0891', department_id: deptOps, risk_name: 'APAC Logistics Hub SPOF', description: 'Single point of failure in central logistics hub (APAC)', risk_type: 'Operational', inherent_likelihood: 4, inherent_impact: 4, inherent_score: 16, inherent_level: 'High', residual_likelihood: 2, residual_impact: 5, residual_score: 10, residual_level: 'Medium', confidence_level: 3, risk_owner_id: analystId, response_type: 'MITIGATE', lifecycle_status: 'MONITORED', created_by: croId },
    { id: 'RSK-0553', department_id: null, risk_name: 'DPDP Data Residency Gap', description: 'Non-adherence to DPDP data residency clauses — Q1 audit gap', risk_type: 'Compliance', inherent_likelihood: 3, inherent_impact: 4, inherent_score: 12, inherent_level: 'Medium', residual_likelihood: 2, residual_impact: 3, residual_score: 6, residual_level: 'Low', confidence_level: 4, risk_owner_id: null, response_type: 'AVOID', lifecycle_status: 'PLANNED', created_by: croId },
    { id: 'RSK-1108', department_id: deptFin, risk_name: 'FX Exposure in Emerging Markets', description: 'FX volatility exposure in emerging market subsidiaries (>$200M)', risk_type: 'Financial', inherent_likelihood: 4, inherent_impact: 5, inherent_score: 20, inherent_level: 'Catastrophic', residual_likelihood: 4, residual_impact: 4, residual_score: 16, residual_level: 'High', confidence_level: 3, risk_owner_id: null, response_type: 'TRANSFER', lifecycle_status: 'IN_PROGRESS', created_by: croId },
    { id: 'RSK-0774', department_id: deptOps, risk_name: 'Taiwan Strait Supply Chain Risk', description: 'APAC supply chain disruption — Taiwan Strait tension scenario', risk_type: 'Geopolitical', inherent_likelihood: 5, inherent_impact: 5, inherent_score: 25, inherent_level: 'Catastrophic', residual_likelihood: 3, residual_impact: 4, residual_score: 12, residual_level: 'Medium', confidence_level: 2, risk_owner_id: analystId, response_type: 'MITIGATE', lifecycle_status: 'UNDER_ANALYSIS', created_by: croId },
    { id: 'RSK-0620', department_id: null, risk_name: 'ESG Disclosure Gap', description: 'Social media crisis vector — ESG disclosure gap identified', risk_type: 'Reputational', inherent_likelihood: 2, inherent_impact: 5, inherent_score: 10, inherent_level: 'Medium', residual_likelihood: 1, residual_impact: 4, residual_score: 4, residual_level: 'Very Low', confidence_level: 5, risk_owner_id: null, response_type: 'ACCEPT', lifecycle_status: 'CLOSED', created_by: croId },
  ]);

  // ── BIA Assessments ────────────────────────────────────────────────────────
  await knex('bia_assessments').insert([
    { id: 'BIA-ASM-001', department_id: deptIT, title: 'تقييم BIA — تقنية المعلومات — 2026', title_en: 'BIA Assessment — IT — 2026', status: 'APPROVED', fiscal_year: 2026, created_by: deptHeadId, approved_by: cisoId, approved_at: '2026-02-15T10:00:00Z' },
    { id: 'BIA-ASM-002', department_id: deptFin, title: 'تقييم BIA — المالية — 2026', title_en: 'BIA Assessment — Finance — 2026', status: 'IN_REVIEW', fiscal_year: 2026, created_by: deptHeadId },
    { id: 'BIA-ASM-003', department_id: deptOps, title: 'تقييم BIA — العمليات — 2026', title_en: 'BIA Assessment — Operations — 2026', status: 'DRAFT', fiscal_year: 2026, created_by: analystId },
  ]);

  // ── BIA Processes ──────────────────────────────────────────────────────────
  await knex('bia_processes').insert([
    { id: 'BIA-PRC-001', assessment_id: 'BIA-ASM-001', process_name: 'خدمات البريد الإلكتروني', process_name_en: 'Enterprise Email Services', process_owner_name: 'م. عبدالله المحمدي', criticality_level: 'CRITICAL', mtpd_hours: 4, rto_hours: 2.8, rpo_hours: 1, mbco_percent: 70 },
    { id: 'BIA-PRC-002', assessment_id: 'BIA-ASM-001', process_name: 'نظام إدارة الهوية (IAM)', process_name_en: 'Identity & Access Management', process_owner_name: 'أ. سارة القحطاني', criticality_level: 'CRITICAL', mtpd_hours: 1, rto_hours: 0.7, rpo_hours: 0.25, mbco_percent: 90 },
    { id: 'BIA-PRC-003', assessment_id: 'BIA-ASM-001', process_name: 'النسخ الاحتياطي', process_name_en: 'Backup & Recovery', process_owner_name: 'م. فهد الشمري', criticality_level: 'HIGH', mtpd_hours: 8, rto_hours: 5.6, rpo_hours: 4, mbco_percent: 60 },
    { id: 'BIA-PRC-004', assessment_id: 'BIA-ASM-002', process_name: 'معالجة المعاملات المالية', process_name_en: 'Financial Transactions', process_owner_name: 'أ. نورة العتيبي', criticality_level: 'CRITICAL', mtpd_hours: 4, rto_hours: 2.8, rpo_hours: 1, mbco_percent: 80 },
  ]);

  // ── Sumood Pillars + Components + KPIs ─────────────────────────────────────
  const pillars = [
    { id: 'P1', name_ar: 'إدارة المخاطر', name_en: 'Risk Management', sort_order: 1 },
    { id: 'P2', name_ar: 'إدارة الطوارئ والأزمات', name_en: 'Emergency & Crisis Management', sort_order: 2 },
    { id: 'P3', name_ar: 'استمرارية الأعمال', name_en: 'Business Continuity', sort_order: 3 },
    { id: 'P4', name_ar: 'إدارة تقنية المعلومات', name_en: 'ICT Management', sort_order: 4 },
    { id: 'P5', name_ar: 'القدرات المؤسسية', name_en: 'Organizational Capabilities', sort_order: 5 },
  ];
  await knex('sumood_pillars').insert(pillars);

  const comps = [
    { id: 'P1-C1', pillar_id: 'P1', code: 'RM-01', name_ar: 'حوكمة المخاطر المؤسسية', name_en: 'Enterprise Risk Governance' },
    { id: 'P1-C2', pillar_id: 'P1', code: 'RM-02', name_ar: 'تقييم المخاطر وتحليلها', name_en: 'Risk Assessment & Analysis' },
    { id: 'P1-C3', pillar_id: 'P1', code: 'RM-03', name_ar: 'معالجة المخاطر ومراقبتها', name_en: 'Risk Treatment & Monitoring' },
    { id: 'P2-C1', pillar_id: 'P2', code: 'EC-01', name_ar: 'التخطيط للطوارئ', name_en: 'Emergency Planning' },
    { id: 'P2-C2', pillar_id: 'P2', code: 'EC-02', name_ar: 'الاستجابة للأزمات', name_en: 'Crisis Response' },
    { id: 'P2-C3', pillar_id: 'P2', code: 'EC-03', name_ar: 'التعافي وإعادة التأهيل', name_en: 'Recovery & Rehabilitation' },
    { id: 'P3-C1', pillar_id: 'P3', code: 'BC-01', name_ar: 'تحليل تأثير الأعمال (BIA)', name_en: 'Business Impact Analysis' },
    { id: 'P3-C2', pillar_id: 'P3', code: 'BC-02', name_ar: 'استراتيجيات الاستمرارية', name_en: 'Continuity Strategies' },
    { id: 'P3-C3', pillar_id: 'P3', code: 'BC-03', name_ar: 'خطط استمرارية الأعمال', name_en: 'Business Continuity Plans' },
    { id: 'P3-C4', pillar_id: 'P3', code: 'BC-04', name_ar: 'التمارين والاختبارات', name_en: 'Exercises & Testing' },
    { id: 'P4-C1', pillar_id: 'P4', code: 'IT-01', name_ar: 'البنية التحتية والتعافي', name_en: 'Infrastructure & DR' },
    { id: 'P4-C2', pillar_id: 'P4', code: 'IT-02', name_ar: 'الأمن السيبراني', name_en: 'Cybersecurity' },
    { id: 'P4-C3', pillar_id: 'P4', code: 'IT-03', name_ar: 'إدارة الموردين التقنيين', name_en: 'ICT Vendor Management' },
    { id: 'P5-C1', pillar_id: 'P5', code: 'OC-01', name_ar: 'القيادة والحوكمة', name_en: 'Leadership & Governance' },
    { id: 'P5-C2', pillar_id: 'P5', code: 'OC-02', name_ar: 'التدريب وبناء القدرات', name_en: 'Training & Capacity Building' },
    { id: 'P5-C3', pillar_id: 'P5', code: 'OC-03', name_ar: 'ثقافة الصمود', name_en: 'Resilience Culture' },
  ];
  await knex('sumood_components').insert(comps);

  // Insert sample KPIs (3 per component for seed brevity)
  const kpiRows = [];
  let kpiIndex = 0;
  comps.forEach(comp => {
    for (let i = 1; i <= 3; i++) {
      kpiIndex++;
      kpiRows.push({
        id: `KPI-${String(kpiIndex).padStart(3, '0')}`,
        component_id: comp.id,
        kpi_code: `${comp.code}-${String(i).padStart(3, '0')}`,
        kpi_text_ar: `مؤشر ${comp.name_ar} #${i}`,
        kpi_text_en: `${comp.name_en} KPI #${i}`,
        weight: 1.0,
        is_applicable: true,
      });
    }
  });
  await knex('sumood_kpis').insert(kpiRows);

  // Seed some assessments
  const assessRows = kpiRows.slice(0, 15).map((kpi, i) => ({
    kpi_id: kpi.id,
    department_id: deptIT,
    fiscal_year: 2026,
    maturity_level: [5, 4, 5, 4, 3, 4, 5, 4, 5, 3, 5, 4, 4, 3, 5][i],
    evidence_notes: '',
    assessed_by: analystId,
  }));
  await knex('sumood_assessments').insert(assessRows);

  console.log('✅ Seed complete: 3 depts, 6 users, 6 risks, 3 BIA assessments, 4 processes, 5 pillars, 16 components, 48 KPIs');
};
