#!/usr/bin/env node
/**
 * ============================================================================
 *  Phase 1: Massive Data Seeding — Volume Stress Script
 * ============================================================================
 *  Seeds the PostgreSQL database with:
 *  - 20,000  Risk entries
 *  -  5,000  BIA Critical Processes (across 100 assessments)
 *  -  2,000  Sumood Self-Assessments
 *
 *  Respects all FK constraints. Uses batch inserts for performance.
 *
 *  Usage:  node scripts/stress-seed.cjs
 * ============================================================================
 */
require('dotenv').config();
const knex = require('knex')(require('../knexfile.cjs'));

// ── Realistic Data Pools ────────────────────────────────────────────────────
const RISK_TYPES  = ['Cybersecurity','Operational','Compliance','Financial','Geopolitical','Reputational','Strategic','Legal'];
const STATUSES    = ['IDENTIFIED','IN_PROGRESS','MONITORED','CLOSED','UNDER_ANALYSIS','PLANNED'];
const RESPONSES   = ['AVOID','TRANSFER','MITIGATE','ACCEPT'];
const CRIT_LEVELS = ['CRITICAL','HIGH','MEDIUM','LOW'];
const BIA_STATUSES = ['DRAFT','IN_REVIEW','APPROVED'];
const IMPACT_CATS = ['OPERATIONAL','FINANCIAL','LEGAL_REGULATORY_STRATEGIC','REPUTATIONAL'];
const DEP_TYPES   = ['IT_SYSTEM','APPLICATION','HUMAN_RESOURCE','SUPPLIER','FACILITY','DATA'];
const PHASES      = ['PRE_DISRUPTION','DURING_DISRUPTION','POST_DISRUPTION'];

const DEPARTMENTS = [
  'f0e1d2c3-b4a5-6789-0123-456789abcdef', // IT
  'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Finance
  'b2c3d4e5-f6a7-8901-2345-678901abcdef', // Operations
];
const USERS = [
  '11111111-1111-1111-1111-111111111111', // Admin
  '22222222-2222-2222-2222-222222222222', // CRO
  '33333333-3333-3333-3333-333333333333', // CISO
  '44444444-4444-4444-4444-444444444444', // Dept Head
  '55555555-5555-5555-5555-555555555555', // BC Coord
  '66666666-6666-6666-6666-666666666666', // Analyst
];

const RISK_NAMES_EN = [
  'Data breach via legacy API','Ransomware attack on core DB','Supply chain disruption',
  'Regulatory non-compliance penalty','FX exposure in emerging markets','Insider threat escalation',
  'Cloud service provider outage','Phishing campaign targeting executives','Third-party vendor SLA breach',
  'DDoS attack on customer portal','Compliance audit failure','Business continuity plan gap',
  'Critical system EOL migration delay','Data sovereignty violation','Operational resilience deficit',
  'Cyber insurance coverage gap','Privileged access misuse','Shadow IT discovery',
  'Geopolitical sanctions impact','ESG reporting deficiency','AI model bias liability',
  'Quantum computing encryption risk','Zero-day exploit exposure','IoT device fleet vulnerability',
  'Physical security breach','Social engineering attack vector','DNS hijacking threat',
  'Container orchestration misconfiguration','API rate limiting bypass','Database replication lag',
];

const BIA_PROCESSES_EN = [
  'Enterprise Email Services','Identity & Access Management','Backup & Recovery',
  'Financial Transaction Processing','Customer Relationship Management','ERP Core',
  'Payroll Processing','Supply Chain Management','Incident Response',
  'Network Operations Center','Help Desk / ITSM','Data Warehouse/BI',
  'Cloud Infrastructure Management','DevOps CI/CD Pipeline','Security Operations Center',
  'Compliance Monitoring System','HR Self-Service Portal','Document Management System',
  'Video Conferencing Platform','Enterprise Resource Planning','Billing & Invoicing',
  'Procurement System','Fleet Management','Quality Assurance Platform',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }

// ── Batch insert helper ─────────────────────────────────────────────────────
async function batchInsert(tableName, rows, chunkSize = 500) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await knex(tableName).insert(chunk);
    process.stdout.write(`\r  ${tableName}: ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
  }
  console.log(` ✅`);
}

async function main() {
  const t0 = Date.now();
  console.log('🔥 Phase 1: Massive Data Seeding — Starting...\n');

  // ── Verify DB connection ──────────────────────────────────────────────────
  try {
    await knex.raw('SELECT 1');
    console.log('✅ PostgreSQL connection verified.\n');
  } catch (e) {
    console.error('❌ PostgreSQL connection FAILED:', e.message);
    console.error('   Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  1) RISKS — 20,000 entries
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📊 Seeding 20,000 Risk entries...');
  const risks = [];
  for (let i = 1; i <= 20000; i++) {
    const iL = rand(1, 5), iI = rand(1, 5);
    const iS = iL * iI;
    const iLevel = iS >= 20 ? 'Catastrophic' : iS >= 15 ? 'High' : iS >= 10 ? 'Medium' : iS >= 5 ? 'Low' : 'Very Low';
    const rL = rand(1, Math.min(iL, 4)), rI = rand(1, Math.min(iI, 4));
    const rS = rL * rI;
    const rLevel = rS >= 20 ? 'Catastrophic' : rS >= 15 ? 'High' : rS >= 10 ? 'Medium' : rS >= 5 ? 'Low' : 'Very Low';

    risks.push({
      id: `RSK-${String(10000 + i).padStart(5, '0')}`,
      department_id: pick(DEPARTMENTS),
      risk_name: `${pick(RISK_NAMES_EN)} — Instance ${i}`,
      description: `Auto-generated stress test risk entry #${i}. This simulates a realistic ${pick(RISK_TYPES).toLowerCase()} risk scenario for volume testing.`,
      risk_type: pick(RISK_TYPES),
      inherent_likelihood: iL,
      inherent_impact: iI,
      inherent_score: iS,
      inherent_level: iLevel,
      residual_likelihood: rL,
      residual_impact: rI,
      residual_score: rS,
      residual_level: rLevel,
      confidence_level: rand(1, 5),
      risk_owner_id: pick(USERS),
      response_type: pick(RESPONSES),
      lifecycle_status: pick(STATUSES),
      mitigation_plan: i % 3 === 0 ? `Mitigation plan for risk ${i}: implement controls and monitor continuously.` : null,
      plan_owner_id: i % 3 === 0 ? pick(USERS) : null,
      implementation_timeframe: pick(['Q1','Q2','Q3','Q4']),
      notes: i % 5 === 0 ? `Priority review needed for risk ${i}` : null,
      created_by: pick(USERS),
      is_archived: i % 100 === 0, // 1% archived
    });
  }
  await batchInsert('risks', risks, 500);

  // ═══════════════════════════════════════════════════════════════════════════
  //  2) BIA — 100 Assessments → 5,000 Processes
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📋 Seeding 100 BIA Assessments + 5,000 Processes...');

  const assessments = [];
  for (let a = 1; a <= 100; a++) {
    assessments.push({
      id: `BIA-ASM-S${String(a).padStart(3, '0')}`,
      department_id: pick(DEPARTMENTS),
      title: `تقييم استمرارية الأعمال — الدورة ${a}`,
      title_en: `BIA Stress Assessment — Cycle ${a}`,
      status: pick(BIA_STATUSES),
      fiscal_year: pick([2025, 2026]),
      created_by: pick(USERS),
    });
  }
  await batchInsert('bia_assessments', assessments, 100);

  const processes = [];
  for (let p = 1; p <= 5000; p++) {
    const mtpd = rand(1, 168);
    const rto = Math.max(0.5, mtpd * (rand(40, 85) / 100)); // RTO < MTPD
    const rpo = Math.max(0.25, rto * (rand(20, 90) / 100)); // RPO <= RTO
    processes.push({
      id: `BIA-PRC-S${String(p).padStart(4, '0')}`,
      assessment_id: `BIA-ASM-S${String(rand(1, 100)).padStart(3, '0')}`,
      process_name: `${pick(BIA_PROCESSES_EN)} — عملية ${p}`,
      process_name_en: `${pick(BIA_PROCESSES_EN)} — Process ${p}`,
      description: `Stress test BIA process #${p} for volume testing`,
      process_owner_name: `Owner ${p}`,
      criticality_level: pick(CRIT_LEVELS),
      mtpd_hours: +mtpd.toFixed(2),
      rto_hours: +rto.toFixed(2),
      rpo_hours: +rpo.toFixed(2),
      mbco_percent: rand(30, 95),
    });
  }
  await batchInsert('bia_processes', processes, 500);

  // BIA Dependencies (2 per process = 10,000)
  console.log('🔗 Seeding 10,000 BIA Dependencies...');
  const deps = [];
  for (let p = 1; p <= 5000; p++) {
    for (let d = 0; d < 2; d++) {
      deps.push({
        process_id: `BIA-PRC-S${String(p).padStart(4, '0')}`,
        dependency_type: pick(DEP_TYPES),
        resource_name: `Resource ${p}-${d}`,
        criticality: pick(['CRITICAL', 'IMPORTANT', 'STANDARD']),
        has_alternative: Math.random() > 0.6,
        min_staff_required: rand(0, 20),
      });
    }
  }
  await batchInsert('bia_dependencies', deps, 500);

  // ═══════════════════════════════════════════════════════════════════════════
  //  3) SUMOOD — 2,000 Assessments
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🏗️ Seeding 2,000 Sumood Assessments...');
  // Get existing KPI IDs
  const kpis = await knex('sumood_kpis').select('id');
  if (kpis.length === 0) {
    console.log('⚠️  No Sumood KPIs found. Run the initial seed first (knex seed:run).');
  } else {
    const sumoodAssessments = [];
    const kpiIds = kpis.map(k => k.id);
    const usedKeys = new Set();

    for (let s = 0; s < 2000; s++) {
      const kpiId = pick(kpiIds);
      const deptId = pick(DEPARTMENTS);
      const year = pick([2025, 2026]);
      const key = `${kpiId}-${deptId}-${year}`;

      // Unique constraint: kpi_id + department_id + fiscal_year
      if (usedKeys.has(key)) continue;
      usedKeys.add(key);

      sumoodAssessments.push({
        kpi_id: kpiId,
        department_id: deptId,
        fiscal_year: year,
        maturity_level: rand(1, 7),
        evidence_notes: `Stress test assessment #${s + 1}`,
        assessed_by: pick(USERS),
      });
    }
    await batchInsert('sumood_assessments', sumoodAssessments, 200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  4) Risk Audit Trail — 40,000 entries (2 per risk)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📝 Seeding 40,000 Risk Audit Trail entries...');
  const auditEntries = [];
  for (let i = 1; i <= 20000; i++) {
    const riskId = `RSK-${String(10000 + i).padStart(5, '0')}`;
    auditEntries.push({
      risk_id: riskId,
      action: 'CREATED',
      user_id: pick(USERS),
    });
    auditEntries.push({
      risk_id: riskId,
      action: 'UPDATED',
      field_changed: pick(['lifecycle_status','residual_score','mitigation_plan','risk_owner']),
      old_value: 'IDENTIFIED',
      new_value: pick(STATUSES),
      user_id: pick(USERS),
    });
  }
  await batchInsert('risk_audit_trail', auditEntries, 1000);

  // ── Summary ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`
╔════════════════════════════════════════════╗
║  🔥 STRESS SEED COMPLETE                  ║
╠════════════════════════════════════════════╣
║  Risks:              20,000               ║
║  BIA Assessments:       100               ║
║  BIA Processes:       5,000               ║
║  BIA Dependencies:   10,000               ║
║  Sumood Assessments:  ~2,000              ║
║  Risk Audit Trail:   40,000               ║
║  ──────────────────────────────────────    ║
║  Total Records:     ~77,100               ║
║  Elapsed:           ${elapsed.padStart(6)}s              ║
╚════════════════════════════════════════════╝
`);

  await knex.destroy();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
