# PROJECT AUDIT — AutoResilience GRC Platform

**Generated:** 2026-04-18T00:45:00+03:00
**Platform:** AutoResilience AI — Enterprise Risk Management Suite (EN + AR)
**Stack:** React 18 + Vite (Frontend) | Express.js + PostgreSQL + Knex (Backend) | OpenRouter AI

---

## 1. File Structure

**Total files (`.js`, `.jsx`, `.json`, `.css`):** 152 (excluding `node_modules`)

```
.\dist\assets\index-Bwc4U5CF.js
.\index.html
.\package-lock.json
.\package.json
.\postcss.config.js
.\server\.env
.\server\.env.example
.\server\config\auth.js
.\server\config\database.js
.\server\jobs\aiCostMonitor.js
.\server\knexfile.cjs
.\server\middleware\auditLog.js
.\server\middleware\authenticate.js
.\server\middleware\authorize.js
.\server\middleware\upload.js
.\server\migrations\001_users_roles.js
.\server\migrations\002_risks.js
.\server\migrations\003_bia.js
.\server\migrations\004_sumood.js
.\server\migrations\005_audit_log.js
.\server\migrations\006_ai_agent.js
.\server\migrations\007_tprm_incidents.js
.\server\migrations\008_quantification_regulatory.js
.\server\migrations\009_performance_indexes.js
.\server\migrations\010_security_hardening.js
.\server\migrations\011_risk_simulations.js
.\server\migrations\012_sumood_compliance_documents.js
.\server\migrations\013_bia_asset_registry.js
.\server\migrations\014_ai_infrastructure.js
.\server\package-lock.json
.\server\package.json
.\server\routes\adminAI.js
.\server\routes\ai.js
.\server\routes\audit.js
.\server\routes\auth.js
.\server\routes\bia.js
.\server\routes\biaAssets.js
.\server\routes\dashboard.js
.\server\routes\incidents.js
.\server\routes\quantification.js
.\server\routes\regulatory.js
.\server\routes\reports.js
.\server\routes\risks.js
.\server\routes\sumood.js
.\server\routes\sumoodCompliance.js
.\server\routes\vendors.js
.\server\routes\workflow.js
.\server\seeds\001_initial_data.js
.\server\server.js
.\server\services\ai\aiService.js
.\server\services\ai\cacheManager.js
.\server\services\ai\config.js
.\server\services\ai\rateLimiter.js
.\server\services\ai\tokenTracker.js
.\server\services\aiService.js
.\server\services\biaAssetService.js
.\server\services\documentExtractionService.js
.\server\services\monteCarloService.js
.\server\services\riskGeneratorService.js
.\server\services\riskSimulationService.js
.\server\services\sumoodComplianceService.js
.\src\App.jsx
.\src\components\AddRiskModal.jsx
.\src\components\ai\AIInsightsBanner.jsx
.\src\components\ai\AIInsightsPanel.jsx
.\src\components\AppShell.jsx
.\src\components\bia\AddEditAssetModal.jsx
.\src\components\bia\AssetDetailDrawer.jsx
.\src\components\bia\BIAAssessmentList.jsx
.\src\components\bia\BIAConsolidatedReport.jsx
.\src\components\bia\BIADependencyMap.jsx
.\src\components\bia\BIAImpactMatrix.jsx
.\src\components\bia\BIAProcessForm.jsx
.\src\components\bia\BIAWorkflowTracker.jsx
.\src\components\dashboard\AIInsightsPanel.jsx
.\src\components\dashboard\ComplianceDistributionPanel.jsx
.\src\components\dashboard\DashboardKPIRow.jsx
.\src\components\dashboard\ExecutiveDashboard.jsx
.\src\components\dashboard\IncidentCommandPanel.jsx
.\src\components\dashboard\OperationalResiliencePanel.jsx
.\src\components\dashboard\RegulatoryCalendarPanel.jsx
.\src\components\dashboard\RiskHeatmapMini.jsx
.\src\components\dashboard\RiskLifecycleFunnel.jsx
.\src\components\dashboard\RiskTrendChart.jsx
.\src\components\incidents\PostIncidentReview.jsx
.\src\components\LanguageToggle.jsx
.\src\components\risk\RiskEditView.jsx
.\src\components\risk\RiskSimulationView.jsx
.\src\components\RiskDetailDrawer.jsx
.\src\components\RiskMatrix.jsx
.\src\components\SettingsToolbar.jsx
.\src\components\sumood\SumoodDashboard.jsx
.\src\components\sumood\SumoodDocumentCompliance.jsx
.\src\components\sumood\SumoodGapAnalysis.jsx
.\src\components\sumood\SumoodSelfAssessment.jsx
.\src\components\ToastProvider.jsx
.\src\components\tprm\VendorAssessmentForm.jsx
.\src\components\tprm\VendorDetailDrawer.jsx
.\src\context\AIContext.jsx
.\src\context\AppContext.jsx
.\src\context\AuthContext.jsx
.\src\context\BIAAssetContext.jsx
.\src\context\BIAContext.jsx
.\src\context\CrisisContext.jsx
.\src\context\IncidentContext.jsx
.\src\context\QuantificationContext.jsx
.\src\context\RegulatoryContext.jsx
.\src\context\RiskContext.jsx
.\src\context\SumoodContext.jsx
.\src\context\VendorContext.jsx
.\src\data\demoBIA.js
.\src\data\demoRisks.js
.\src\data\mockDashboard.js
.\src\data\mockSimulation.js
.\src\data\mockSumoodCompliance.js
.\src\data\translations.js
.\src\hooks\useCountUp.js
.\src\hooks\useSubmitGuard.js
.\src\index.css
.\src\main.jsx
.\src\pages\admin\AISystemDashboard.jsx
.\src\pages\AIAgentView.jsx
.\src\pages\AIRiskAssistant.jsx
.\src\pages\AutoResilienceAR.jsx
.\src\pages\AutoResilienceEN.jsx
.\src\pages\BIAAssetRegistry.jsx
.\src\pages\ComplianceDashboard.jsx
.\src\pages\ERMPlatform.jsx
.\src\pages\ExecutiveBriefing.jsx
.\src\pages\IncidentDetail.jsx
.\src\pages\IncidentManagement.jsx
.\src\pages\NRECDashboard.jsx
.\src\pages\RegulatoryIntelligence.jsx
.\src\pages\RiskQuantification.jsx
.\src\pages\SOPPlaybookAR.jsx
.\src\pages\SOPPlaybookEN.jsx
.\src\pages\SumoodPage.jsx
.\src\pages\VendorManagement.jsx
.\src\services\api.js
.\src\services\mockAIService.js
.\src\utils\exportUtils.js
.\src\utils\riskUtils.js
.\tailwind.config.js
.\vercel.json
.\vite.config.js
```

---

## 2. Package Dependencies

### Root `package.json` (Frontend)

```json
{
  "name": "autoresilience-suite",
  "version": "1.0.0",
  "description": "AutoResilience AI — Enterprise Risk Management Suite (EN + AR)",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "jspdf": "^4.2.1",
    "jspdf-autotable": "^5.0.7",
    "lucide-react": "^0.446.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.8"
  }
}
```

### `server/package.json` (Backend)

```json
{
  "name": "grc-platform-server",
  "version": "1.0.0",
  "description": "GRC Platform Backend — Express.js + PostgreSQL",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "migrate": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "seed": "knex seed:run"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "exceljs": "^4.4.0",
    "express": "^4.21.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "knex": "^3.1.0",
    "morgan": "^1.10.0",
    "openai": "^6.34.0",
    "pdfkit": "^0.15.0",
    "pg": "^8.13.0"
  }
}
```

---

## 3. Database Schema

**Total migrations:** 14 files
**Database:** PostgreSQL (via Knex.js ORM)

### Migration 001 — Users, Roles, Departments (`001_users_roles.js`)

| Table | Columns | Notes |
|---|---|---|
| `departments` | `id` (UUID PK), `name_ar`, `name_en`, `parent_id` (FK→departments), `head_user_id` (FK→users) | Hierarchical department structure |
| `users` | `id` (UUID PK), `email` (unique), `password_hash`, `full_name_ar`, `full_name_en`, `department_id`, `role` (ENUM: ADMIN/CRO/CISO/CEO/DEPT_HEAD/BC_COORDINATOR/ANALYST/VIEWER), `permissions` (JSONB), `is_active` | RBAC with 8 roles |

### Migration 002 — Risks, Treatments, Audit Trail (`002_risks.js`)

| Table | Columns | Notes |
|---|---|---|
| `risks` | `id` (RSK-XXXX PK), `department_id`, `risk_name`, `description`, `risk_type`, `inherent_likelihood` (1-5), `inherent_impact` (1-5), `inherent_score`, `inherent_level`, `residual_likelihood`, `residual_impact`, `residual_score`, `residual_level`, `confidence_level` (1-5), `risk_owner_id`, `response_type` (AVOID/TRANSFER/MITIGATE/ACCEPT), `lifecycle_status`, `mitigation_plan`, `plan_owner_id`, `implementation_timeframe`, `notes`, `created_by`, `is_archived` | ISO 31000 compliant 5×5 matrix |
| `risk_treatments` | `id` (UUID), `risk_id` (FK→risks CASCADE), `treatment_type` (ENUM), `description`, `plan_owner_id`, `target_date`, `status`, `completion_pct` (0-100) | Treatment plan tracking |
| `risk_audit_trail` | `id` (UUID), `risk_id`, `action`, `field_changed`, `old_value`, `new_value`, `user_id`, `created_at` | Immutable change log |

### Migration 003 — BIA Module (`003_bia.js`)

| Table | Key Purpose |
|---|---|
| `bia_assessments` | Assessment cycles (BIA-ASM-XXX), status workflow (DRAFT→IN_REVIEW→APPROVED→ARCHIVED) |
| `bia_processes` | Business processes with MTPD/RTO/RPO/MBCO metrics, criticality levels |
| `bia_impact_ratings` | 4 categories × 7 time intervals, severity 1-5, with unique constraint |
| `bia_dependencies` | Resource dependencies (IT_SYSTEM/APPLICATION/HUMAN_RESOURCE/SUPPLIER/FACILITY/DATA) |
| `bia_recovery_strategies` | Pre/During/Post disruption strategies, costs in SAR |
| `bia_risk_links` | Cross-references BIA processes to risks |
| `bia_workflow_steps` | Multi-level approval pipeline (DEPT_HEAD→BC_COORDINATOR→CISO→CEO, 5-day SLA) |

### Migration 004 — Sumood National Resilience Index (`004_sumood.js`)

| Table | Key Purpose |
|---|---|
| `sumood_pillars` | P1, P2, ... — top-level pillars (bilingual) |
| `sumood_components` | P1-C1, P1-C2 — component codes under pillars |
| `sumood_kpis` | Weighted KPIs with applicability flag |
| `sumood_assessments` | Maturity level 1-7 per KPI + department + fiscal year (unique constraint) |

### Migration 005 — Immutable Audit Log (`005_audit_log.js`)

| Table | Notes |
|---|---|
| `audit_log` | INSERT-only. `bigIncrements` PK, user_id, action, entity_type, entity_id, details (JSONB), ip_address, user_agent. Indexed. |

### Migration 006 — AI Risk Intelligence Agent (`006_ai_agent.js`)

| Table | Key Purpose |
|---|---|
| `ai_conversations` | Per-user conversations with context type (RISK_ANALYSIS/BIA_REVIEW/SUMOOD_GAP/etc.) |
| `ai_messages` | Chat history with token tracking and model info |
| `ai_scheduled_analyses` | Cron-based analysis jobs (DAILY_RISK_SCAN, WEEKLY_BIA_REVIEW, etc.) |
| `ai_insights` | AI-generated findings: RISK_ANOMALY/COMPLIANCE_GAP/BIA_INCONSISTENCY/etc. with severity and resolution tracking |

### Migration 007 — TPRM + Incident Management (`007_tprm_incidents.js`)

| Table | Key Purpose |
|---|---|
| `vendors` | Vendor registry with data access levels, offshore flags, criticality |
| `vendor_assessments` | 6-dimension risk scoring (financial/cyber/compliance/operational/data/BC), computed overall+tier |
| `vendor_bia_links` | Link vendors to BIA dependencies |
| `vendor_risk_links` | Link vendors to risks |
| `incidents` | INC-YYYY-XXXX format, full lifecycle timestamps, regulatory notification tracking |
| `incident_timeline` | Event log (DETECTION/ESCALATION/ACTION_TAKEN/STATUS_CHANGE/COMMUNICATION/RESOLUTION) |
| `incident_risk_links` | Link incidents to materialized risks |
| `post_incident_reviews` | After-action reviews with action items, BCP/risk register update flags |

### Migration 008 — Monte Carlo + Regulatory Intelligence (`008_quantification_regulatory.js`)

| Table | Key Purpose |
|---|---|
| `risk_quantification` | PERT simulation results: mean/median/p90/p95/p99/ALE/VaR, histogram data (JSONB) |
| `risk_quantification_portfolio` | Enterprise-level aggregated portfolio simulation |
| `regulatory_bodies` | Seeded: NCA, SAMA, DGA, NDMO, SDAIA, CMA (bilingual names + URLs) |
| `regulatory_updates` | Notifications, amendments, circulars with compliance deadlines and impact tracking |
| `regulatory_action_items` | Compliance tasks with deadlines and status tracking |

### Migration 009 — Performance Indexes (`009_performance_indexes.js`)

- **30+ indexes** added for critical query paths across `risks`, `risk_audit_trail`, `risk_treatments`, `bia_processes`, `bia_assessments`, `bia_dependencies`, `bia_impact_ratings`, `sumood_assessments`, `sumood_kpis`, `sumood_components`, `audit_log`
- Composite indexes for common filter patterns (e.g., `is_archived + lifecycle_status + created_at`)

### Migration 010 — Security Hardening (`010_security_hardening.js`)

- **PostgreSQL TRIGGERS** to enforce immutability on `audit_log` and `risk_audit_trail` (blocks UPDATE/DELETE)
- Referenced as Red Team Auto-Fix, ISO 22301 §9.2

### Migration 011 — Risk Simulations (`011_risk_simulations.js`)

| Table | Key Purpose |
|---|---|
| `risk_simulations` | AI-powered scenario snapshots with best/likely/worst scenarios (JSONB), confidence score |

### Migration 012 — Sumood Compliance Documents (`012_sumood_compliance_documents.js`)

| Table | Key Purpose |
|---|---|
| `sumood_documents` | Uploaded document metadata, SHA-256 hash dedup, analysis status |
| `sumood_document_kpi_mappings` | AI-generated per-KPI compliance analysis (FULLY_MET/PARTIALLY_MET/MENTIONED/NOT_ADDRESSED) |
| `sumood_analysis_summaries` | Executive summary with gap/recommendation counts |

### Migration 013 — BIA Asset Registry (`013_bia_asset_registry.js`)

| Table | Key Purpose |
|---|---|
| `bia_assets` | ISO 22301 §8.2.2 — assets with RTO/RPO/MTPD, 8 types, 4 criticality levels |
| `bia_asset_process_links` | Link assets to BIA processes with dependency type |
| `bia_asset_dependencies` | Inter-asset relationships (DEPENDS_ON/HOSTS/FEEDS_DATA/MANAGED_BY) |

### Migration 014 — AI Infrastructure (`014_ai_infrastructure.js`)

| Table | Key Purpose |
|---|---|
| `ai_cache` | Key-value cache with TTL expiry |
| `ai_usage_logs` | Per-request tracking: feature, model, tokens, latency, cost, cache hits |

---

## 4. API Routes

**Base path:** `/api/v1`
**Total route files:** 16
**Middleware:** authenticate (JWT), authorize (RBAC), auditLog (immutable logging)

### `auth.js` — Authentication (`/api/v1/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/login` | Authenticate user, return JWT + permissions |
| POST | `/refresh` | Refresh JWT token |
| GET | `/me` | Get current user profile |

### `risks.js` — Risk Management (`/api/v1/risks`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List risks with filters (department, status, type, search), sorting, pagination |
| GET | `/matrix` | Risk matrix 5×5 aggregation with optional cell detail |
| GET | `/:id` | Single risk with treatments + audit trail |
| POST | `/` | Create risk (ISO 31000 validation: bounds, residual≤inherent, catastrophic mandates) |
| PATCH | `/:id` | Update risk with field-level audit trail |
| DELETE | `/:id` | Soft-delete (archive) risk |
| POST | `/:id/treatments` | Add treatment plan to risk |
| GET | `/:id/audit-trail` | Get risk change history with user names |
| POST | `/:id/simulate` | Run AI-powered scenario simulation |
| GET | `/:id/simulations` | List past simulations for risk |

### `bia.js` — Business Impact Analysis (`/api/v1/bia`)

| Method | Path | Description |
|---|---|---|
| GET | `/assessments` | List BIA assessments with filters |
| GET | `/assessments/:id` | Assessment detail with processes + workflow |
| POST | `/assessments` | Create new BIA assessment |
| PATCH | `/assessments/:id` | Update assessment |
| GET | `/processes` | List BIA processes |
| POST | `/processes` | Create process (validates RTO<MTPD, RPO≤RTO) |
| PATCH | `/processes/:id` | Update process with timing validation |
| DELETE | `/processes/:id` | Delete process |
| GET | `/impact-ratings/:processId` | Get impact ratings for process |
| PUT | `/impact-ratings/:processId` | Bulk upsert impact ratings |
| GET | `/dependencies` | List dependencies |
| POST | `/dependencies` | Add dependency |
| DELETE | `/dependencies/:id` | Remove dependency |
| GET | `/recovery-strategies` | List recovery strategies |
| POST | `/recovery-strategies` | Add recovery strategy |
| DELETE | `/recovery-strategies/:id` | Remove recovery strategy |
| GET | `/risk-links` | List risk links |
| POST | `/risk-links` | Add risk link |
| DELETE | `/risk-links/:id` | Remove risk link |
| POST | `/consolidate/:year` | Generate consolidated org-wide BIA report |

### `biaAssets.js` — BIA Asset Registry (`/api/v1/bia-assets`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List/search assets with filters |
| GET | `/dashboard` | Dashboard stats (by type, criticality, status, SPOF count) |
| GET | `/graph` | Dependency graph (adjacency list) |
| GET | `/spofs` | Detect Single Points of Failure |
| GET | `/:id` | Asset detail with process links + dependencies |
| POST | `/` | Create asset (auto-generates code) |
| PUT | `/:id` | Update asset |
| DELETE | `/:id` | Delete asset |
| POST | `/:id/processes` | Link process to asset |
| DELETE | `/:id/processes/:processId` | Unlink process |

### `sumood.js` — Sumood National Resilience Index (`/api/v1/sumood`)

| Method | Path | Description |
|---|---|---|
| GET | `/pillars` | Full hierarchy: pillars → components → KPIs |
| GET | `/kpis/:componentId` | KPIs for a specific component |
| POST | `/assess` | Single KPI assessment (upsert) |
| POST | `/assess/batch` | Batch assessment (up to 500 entries, all-or-nothing validation) |
| GET | `/scores/:dept/:year` | Computed weighted scores: KPI → component → pillar → org |
| GET | `/gap-analysis/:dept/:year` | Gap analysis with priorities and Arabic recommendations |

### `sumoodCompliance.js` — Document Compliance (`/api/v1/sumood-compliance`)

| Method | Path | Description |
|---|---|---|
| POST | `/documents/upload` | Upload document (SHA-256 dedup), trigger async AI analysis |
| GET | `/documents` | List uploaded documents |
| GET | `/documents/:id` | Document detail with analysis summary + KPI mappings |
| POST | `/documents/:id/reanalyze` | Re-run AI analysis on document |
| DELETE | `/documents/:id` | Delete document and file |

### `ai.js` — AI Intelligence Agent (`/api/v1/ai`)

| Method | Path | Description |
|---|---|---|
| POST | `/conversations` | Create new AI conversation |
| GET | `/conversations` | List user's conversations |
| GET | `/conversations/:id` | Get conversation with messages |
| POST | `/conversations/:id/message` | Send message, get AI response |
| DELETE | `/conversations/:id` | Archive conversation |
| GET | `/insights` | List AI-generated insights (filter by severity/status/type) |
| PATCH | `/insights/:id` | Update insight status |
| POST | `/analyze/risks` | On-demand daily risk scan |
| POST | `/analyze/bia` | On-demand weekly BIA review |
| POST | `/analyze/sumood` | On-demand monthly Sumood audit |
| POST | `/analyze/compliance` | On-demand compliance drift check |
| GET | `/scheduled` | List scheduled analyses |
| POST | `/scheduled` | Create scheduled analysis |
| PATCH | `/scheduled/:id` | Toggle schedule active/inactive |
| POST | `/generate-risks` | AI risk generation from employee tasks (department-specific persona) |

### `adminAI.js` — AI Administration (`/api/v1/admin/ai`)

| Method | Path | Description |
|---|---|---|
| GET | `/models` | List available open-source models from OpenRouter |
| GET | `/usage` | Aggregated AI usage statistics |
| POST | `/test` | Test AI connection with Arabic prompt |
| POST | `/cache/clear` | Clear AI response cache |
| GET | `/config` | Current AI config (no secrets) |

### `vendors.js` — Third-Party Risk Management (`/api/v1/vendors`)

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Vendor dashboard (total, by tier, expiring, avg score) |
| GET | `/expiring` | List vendors with expiring contracts |
| GET | `/` | List vendors with filters + latest risk tier |
| POST | `/` | Create vendor |
| GET | `/:id` | Vendor detail + assessments + BIA/risk links |
| PATCH | `/:id` | Update vendor |
| DELETE | `/:id` | Terminate vendor (soft) |
| POST | `/:id/assessments` | Add risk assessment (6-dimension scoring) |
| GET | `/:id/assessments` | Assessment history |
| POST | `/:id/link-bia` | Link to BIA dependency |
| POST | `/:id/link-risk` | Link to risk |

### `incidents.js` — Incident Management (`/api/v1/incidents`)

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Dashboard (open count, by severity, monthly, avg resolution, pending notifications) |
| GET | `/` | List incidents with filters + pagination |
| POST | `/` | Create incident + auto-detect timeline event |
| GET | `/:id` | Incident detail + timeline + risk links + review |
| PATCH | `/:id` | Update incident |
| POST | `/:id/timeline` | Add timeline event |
| GET | `/:id/timeline` | Full timeline |
| POST | `/:id/link-risk` | Link to risk |
| PATCH | `/:id/status` | Change status (auto timestamps + timeline entry) |
| GET | `/:id/review` | Get post-incident review |
| POST | `/:id/review` | Create/update post-incident review |

### `quantification.js` — Monte Carlo Risk Quantification (`/api/v1/quantification`)

| Method | Path | Description |
|---|---|---|
| POST | `/simulate/:riskId` | Run Monte Carlo simulation (10K runs, PERT distribution) |
| GET | `/:riskId` | Get quantification results |
| GET | `/` | List all quantified risks with ALE ranking |
| POST | `/portfolio/:year` | Run portfolio-level Monte Carlo |
| GET | `/portfolio/:year` | Get portfolio results |

### `regulatory.js` — Regulatory Intelligence (`/api/v1/regulatory`)

| Method | Path | Description |
|---|---|---|
| GET | `/bodies` | List regulatory bodies |
| GET | `/dashboard` | Dashboard (totals, overdue, pending, compliance rate) |
| GET | `/calendar` | Upcoming compliance deadlines (configurable window) |
| GET | `/updates` | List regulatory updates with filters |
| POST | `/updates` | Create regulatory update |
| GET | `/updates/:id` | Update detail with action items |
| PATCH | `/updates/:id` | Edit update |
| POST | `/updates/:id/actions` | Add action item |
| PATCH | `/actions/:id` | Update action item status |

### `workflow.js` — BIA Approval Workflow (`/api/v1/workflow`)

| Method | Path | Description |
|---|---|---|
| POST | `/submit/:assessmentId` | Submit assessment for approval (DRAFT→IN_REVIEW) |
| POST | `/approve/:stepId` | Approve step, auto-advance to next role |
| POST | `/reject/:stepId` | Reject step (mandatory comments), revert to DRAFT |
| GET | `/:assessmentId` | Get workflow steps |
| POST | `/escalate` | Auto-escalate overdue steps (SLA breach) |

### `dashboard.js` — Executive Dashboard (`/api/v1/dashboard`)

| Method | Path | Description |
|---|---|---|
| GET | `/summary` | KPI summary (risk score, compliance, 3rd-party, anomalies, incidents, ALE). 60s cache. |

### `reports.js` — Export Reports (`/api/v1/reports`)

| Method | Path | Description |
|---|---|---|
| GET | `/risk-register/pdf` | Export risk register as PDF (landscape A4, color-coded) |
| GET | `/risk-register/excel` | Export risk register as XLSX (conditional formatting) |
| GET | `/bia-consolidated/pdf` | Export BIA consolidated report as PDF |
| GET | `/sumood-dashboard/pdf` | Export Sumood scores as PDF |

### `audit.js` — Audit Log (`/api/v1/audit`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Query audit log with filters (entity, user, date range) + pagination |

---

## 5. Frontend Pages

**Total pages:** 18 (17 files + 1 admin subdirectory)
**Router:** React Router v6 with nested layout (`AppShell`)

| Component | Route | Description |
|---|---|---|
| `ERMPlatform` | `/erm` (default) | Enterprise Risk Management hub — risk register, matrix, dashboard tabs |
| `NRECDashboard` | `/nrec` | KSA National Resilience Executive Center — full executive dashboard |
| `AIRiskAssistant` | `/ai-risk` | AI-powered employee risk identification with department personas |
| `AIAgentView` | `/ai-agent` | Conversational AI Risk Intelligence Agent |
| `VendorManagement` | `/vendors` | Third-Party Risk Management with assessment forms |
| `IncidentManagement` | `/incidents` | Incident listing, dashboard, creation |
| `IncidentDetail` | `/incidents/:id` | Single incident detail with timeline and review |
| `RiskQuantification` | `/quantification` | Monte Carlo simulation dashboard |
| `RegulatoryIntelligence` | `/regulatory` | Regulatory updates, calendar, action items |
| `ComplianceDashboard` | `/compliance` | Compliance posture overview |
| `SumoodPage` | `/sumood` | Sumood Index — dashboard, self-assessment, gap analysis tabs |
| `BIAAssetRegistry` | `/bia-assets` | ISO 22301 asset registry with SPOF detection |
| `ExecutiveBriefing` | `/executive` | CEO-level briefing with KPIs and AI summary |
| `SOPPlaybookEN` | `/sop-en` | Standard Operating Procedures (English) |
| `SOPPlaybookAR` | `/sop-ar` | Standard Operating Procedures (Arabic) |
| `AutoResilienceEN` | — | Full English dashboard (legacy monolith) |
| `AutoResilienceAR` | — | Full Arabic dashboard (legacy monolith) |
| `AISystemDashboard` | `/admin/ai` | AI system monitoring — models, usage, cache, config |

---

## 6. Environment Variables

**File:** `server/.env.example`

```env
# Server Environment
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/grc_platform
JWT_SECRET=change-me-to-a-strong-random-secret-in-production
JWT_EXPIRY=8h
PORT=3001

# ============ AI CONFIGURATION (OpenRouter) ============
# Get your API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-**********************

# Model selection (OpenRouter model IDs)
# Best for Arabic reasoning (~$0.40/M tokens)
AI_PRIMARY_MODEL=qwen/qwen-2.5-72b-instruct
# Fast & cheap for simple tasks (~$0.14/M tokens)
AI_FAST_MODEL=deepseek/deepseek-chat
# Fallback if primary fails
AI_FALLBACK_MODEL=meta-llama/llama-3.3-70b-instruct

# App URL (for OpenRouter referer header)
APP_URL=https://your-deployed-platform.com

# Cache
AI_CACHE_ENABLED=true
AI_CACHE_TTL_SECONDS=3600
```

---

## 7. Services

### `server/services/ai/aiService.js` — Unified AI Service (Singleton)

| Exported | Description |
|---|---|
| `chat(prompt, options)` | Main chat completion via OpenRouter — model auto-selection, rate limiting, caching, token tracking, fallback |
| `generateJSON(prompt, schema, options)` | Structured JSON generation with auto-retry on parse failure |
| `analyzeDocument(text, schema, options)` | Large document analysis with automatic chunking |
| `stream(prompt, onToken, options)` | Streaming responses for real-time chat |
| `listAvailableModels()` | List open-source models from OpenRouter (Qwen/Llama/DeepSeek/Mistral) |

### `server/services/ai/cacheManager.js`
| Exported | Description |
|---|---|
| `CacheManager` (class) | PostgreSQL-backed response cache with TTL, SHA-256 key generation |

### `server/services/ai/config.js`
| Exported | Description |
|---|---|
| `getConfig()` | Returns AI provider config (models, cache settings) from environment |

### `server/services/ai/rateLimiter.js`
| Exported | Description |
|---|---|
| `RateLimiter` (class) | In-memory per-user, per-feature rate limiting |

### `server/services/ai/tokenTracker.js`
| Exported | Description |
|---|---|
| `TokenTracker` (class) | Tracks AI usage, tokens, cost, latency per request in `ai_usage_logs` table |

### `server/services/aiService.js` — Platform AI Orchestrator

| Exported | Description |
|---|---|
| `chat(conversationId, userMessage)` | Context-aware chat using platform data (risks, BIA, Sumood) — saves messages to DB |
| `runScheduledAnalysis(type)` | Runs DAILY_RISK_SCAN / WEEKLY_BIA_REVIEW / MONTHLY_SUMOOD_AUDIT / COMPLIANCE_DRIFT_CHECK |
| `getPlatformContext()` | Gathers live platform data for AI context injection |

### `server/services/monteCarloService.js` — Monte Carlo Simulation

| Exported | Description |
|---|---|
| `runSimulation(min, mostLikely, max, probPct, runs)` | Single-risk PERT-distribution Monte Carlo (10K runs default) returning percentile stats + histogram |
| `runPortfolioSimulation(risks, runs)` | Multi-risk portfolio aggregation simulation |

### `server/services/riskSimulationService.js` — AI Scenario Simulation

| Exported | Description |
|---|---|
| `simulateRisk(riskId, userId)` | AI-generated best/likely/worst scenarios with mitigation strategies, cross-references BIA data |

### `server/services/riskGeneratorService.js` — AI Risk Generator

| Exported | Description |
|---|---|
| `generateRisks(name, dept, tasks, language, userId)` | Department-persona-driven risk generation (6-8 risks per request), bilingual output |

### `server/services/biaAssetService.js` — BIA Asset Registry

| Exported | Description |
|---|---|
| `listAssets(filters)` | Search/filter assets |
| `getAssetById(id)` | Asset with process links + dependencies |
| `createAsset(data, userId)` | Create with auto-generated code (ITS-0001, APP-0001, etc.) |
| `updateAsset(id, data, userId)` | Update asset |
| `deleteAsset(id)` | Delete asset |
| `linkProcess(assetId, processId, data)` | Link/upsert process to asset |
| `unlinkProcess(assetId, processId)` | Remove process link |
| `computeInheritedRTO(assetId)` | Calculate RTO from linked processes (minimum) |
| `detectSPOFs()` | Find critical assets with no alternatives |
| `getDashboardStats()` | Aggregated stats by type/criticality/status/SPOF |
| `getDependencyGraph()` | Adjacency list for asset dependency visualization |

### `server/services/sumoodComplianceService.js` — Document Compliance Analysis

| Exported | Description |
|---|---|
| `analyzeDocument(documentId)` | Full pipeline: extract text → classify document → analyze per-pillar KPI compliance → save mappings + summary |

### `server/services/documentExtractionService.js` — Text Extraction

| Exported | Description |
|---|---|
| `extractText(filePath)` | Extracts text from PDF (pdf-parse), DOCX (mammoth), XLSX (xlsx), TXT files |

---

## 8. Translation Coverage

### Key Count

| Metric | Count |
|---|---|
| **Total translation keys** | **316** |
| Languages supported | 2 (Arabic `ar`, English `en`) |

### Translation Categories

| Category | Prefix | Approx. Keys |
|---|---|---|
| Navigation | `nav.*` | 22 |
| Sidebar | `sidebar.*` | 12 |
| Header | `header.*` | 6 |
| Actions | `action.*` | 20 |
| Status | `status.*` | 14 |
| Risk Levels | `risk.*` | 20 |
| Dashboard | `dashboard.*` | 24 |
| AI Insights | `ai.*` | 6 |
| Risk Register | `register.*` | 12 |
| BIA | `bia.*` | 8 |
| Sumood | `sumood.*` | 4 |
| Vendors | `vendor.*` | 10 |
| Incidents | `incident.*` | 8 |
| Quantification | `quant.*` | 6 |
| Regulatory | `reg.*` | 6 |
| Settings | `settings.*` | 5 |
| Simulation | `sim.*` | 12 |
| AI Risk Assistant | `aiRisk.*` | 34 |
| Other | Various | ~87 |

### Hardcoded English Strings Found in JSX

The following components contain **hardcoded English** strings not routed through the translation system:

| File | Examples |
|---|---|
| `AIInsightsPanel.jsx` | "AI Insights", "RECOMMENDED ACTIONS" |
| `AssetDetailDrawer.jsx` | "MTPD" |
| `BIAAssessmentList.jsx` | "CISO" |
| `BIAProcessForm.jsx` | "MTPD" |
| `PostIncidentReview.jsx` | "Action Items", "Open", "In Progress", "Done" |
| `VendorAssessmentForm.jsx` | "Risk Assessment", "Overall Risk Score", "Poor/Fair/Good/Very Good/Excellent", "Notes", "Next Review Date" |
| `VendorDetailDrawer.jsx` | "Contact Information", "Contract", "Assessment" |
| `AppShell.jsx` | "Khalid Alghofaili", "CISO" |
| `AISystemDashboard.jsx` | "Cache Hit Rate", "Feature", "Calls", "Tokens", "Avg Latency", "Model" |

> **Recommendation:** ~30+ hardcoded strings across 9 components need migration to the translation system for full RTL/bilingual support.

---

## 9. Known Issues

### TODO / FIXME / HACK Comments

| File | Line | Comment |
|---|---|---|
| `server/jobs/aiCostMonitor.js` | 26 | `// TODO: Insert into notifications table or send email to admin` |

> **Summary:** Only **1 TODO** found in the entire codebase. No FIXME or HACK comments.

---

## 10. Line Count Summary

### Total Lines of Code

| Metric | Value |
|---|---|
| **Total lines** (`.js` + `.jsx`, excluding `node_modules`) | **25,410** |
| **Total files** (`.js`, `.jsx`, `.json`, `.css`, excluding `node_modules`) | **152** |

### Top 20 Files by Line Count

| Lines | File |
|---|---|
| 1,663 | `src/pages/AutoResilienceEN.jsx` |
| 1,466 | `src/pages/AutoResilienceAR.jsx` |
| 961 | `src/pages/NRECDashboard.jsx` |
| 868 | `dist/assets/index-Bwc4U5CF.js` (build artifact) |
| 867 | `src/pages/SOPPlaybookEN.jsx` |
| 829 | `src/components/AddRiskModal.jsx` |
| 825 | `src/pages/SOPPlaybookAR.jsx` |
| 587 | `src/components/sumood/SumoodDocumentCompliance.jsx` |
| 483 | `src/pages/BIAAssetRegistry.jsx` |
| 472 | `src/components/risk/RiskSimulationView.jsx` |
| 436 | `src/components/RiskDetailDrawer.jsx` |
| 428 | `src/pages/AIRiskAssistant.jsx` |
| 387 | `src/pages/ExecutiveBriefing.jsx` |
| 371 | `src/context/SumoodContext.jsx` |
| 365 | `src/components/risk/RiskEditView.jsx` |
| 349 | `src/components/AppShell.jsx` |
| 348 | `src/data/translations.js` |
| 338 | `src/pages/AIAgentView.jsx` |
| 307 | `src/context/BIAContext.jsx` |
| 295 | `server/services/ai/aiService.js` |

### Distribution

| Layer | Files | Est. Lines |
|---|---|---|
| Frontend (src/) | ~80 | ~16,500 |
| Backend (server/) | ~40 | ~7,000 |
| Config/Build | ~10 | ~300 |
| Data/Translations | ~6 | ~1,600 |

---

## Summary Statistics

| Category | Count |
|---|---|
| Database Tables | **42** |
| API Endpoints | **~100** |
| Frontend Pages | **18** |
| React Context Providers | **9** |
| Server Services | **12** |
| Database Indexes | **30+** |
| DB Triggers | **4** (immutability enforcement) |
| Seeded Regulatory Bodies | **6** (NCA, SAMA, DGA, NDMO, SDAIA, CMA) |
| User Roles | **8** (ADMIN→VIEWER) |
| Translation Keys | **316** (AR+EN) |
| Hardcoded String Files | **9** (need i18n migration) |
| TODO/FIXME Comments | **1** |
| Total Lines of Code | **25,410** |
| Total Source Files | **152** |
