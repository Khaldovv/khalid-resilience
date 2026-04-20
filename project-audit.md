# Project Audit & Architecture Overview

## 1. Full Directory Tree

```text
C:\USERS\XVSAU\ONEDRIVE\DESKTOP\PROJECT
|-- package.json
|-- package-lock.json
|-- vite.config.js
|-- tailwind.config.js
|-- postcss.config.js
|-- vercel.json
|-- index.html
|-- README.md
|-- BRD.md
|-- src/
|   |-- main.jsx
|   |-- App.jsx
|   |-- index.css
|   |-- components/
|   |-- pages/
|   |-- context/
|   |-- data/
|   |-- services/
|-- server/
|   |-- package.json
|   |-- package-lock.json
|   |-- server.js
|   |-- knexfile.cjs
|   |-- .env.example
|   |-- config/
|   |-- middleware/
|       |-- authenticate.js
|       |-- authorize.js
|       |-- auditLog.js
|   |-- migrations/
|       |-- 001_users_roles.js
|       |-- 002_risks.js
|       |-- 003_bia.js
|       |-- 004_sumood.js
|       |-- 005_audit_log.js
|   |-- seeds/
|   |-- routes/
|       |-- auth.js
|       |-- risks.js
|       |-- bia.js
|       |-- sumood.js
|       |-- workflow.js
|       |-- reports.js
|       |-- audit.js
```

## 2. Complete Database Schema

### Users & Departments
- **`departments`**: `id` (UUID), `name_ar` (String), `name_en` (String), `parent_id` (UUID), `head_user_id` (UUID), `created_at`, `updated_at`.
- **`users`**: `id` (UUID), `email` (String), `password_hash` (String), `full_name_ar` (String), `full_name_en` (String), `department_id` (UUID), `role` (Enum [ADMIN, CRO, CISO, CEO, DEPT_HEAD, BC_COORDINATOR, ANALYST, VIEWER]), `permissions` (JSONB), `is_active` (Boolean), `created_at`, `updated_at`.

### Enterprise Risk Management (ERM)
- **`risks`**: `id` (String: RSK-XXXX), `department_id` (UUID), `risk_name` (String), `description` (Text), `risk_type` (String), `inherent_likelihood` (Int), `inherent_impact` (Int), `inherent_score` (Int), `inherent_level` (String), `residual_likelihood` (Int), `residual_impact` (Int), `residual_score` (Int), `residual_level` (String), `confidence_level` (Int), `risk_owner_id` (UUID), `response_type` (String), `lifecycle_status` (String), `mitigation_plan` (Text), `plan_owner_id` (UUID), `implementation_timeframe` (String), `notes` (Text), `created_by` (UUID), `is_archived` (Boolean), `created_at`, `updated_at`.
- **`risk_treatments`**: `id` (UUID), `risk_id` (String), `treatment_type` (Enum [AVOID, TRANSFER, MITIGATE, ACCEPT]), `description` (Text), `plan_owner_id` (UUID), `target_date` (Date), `status` (String), `completion_pct` (Int 0-100), `created_at`, `updated_at`.
- **`risk_audit_trail`**: `id` (UUID), `risk_id` (String), `action` (String), `field_changed` (String), `old_value` (Text), `new_value` (Text), `user_id` (UUID), `created_at` (Timestamp).

### Business Impact Analysis (BIA)
- **`bia_assessments`**: `id` (String), `department_id` (UUID), `title` (String), `status` (Enum [DRAFT, IN_REVIEW, APPROVED, ARCHIVED]), `fiscal_year` (Int), `created_by` (UUID), `approved_by` (UUID).
- **`bia_processes`**: `id` (String), `assessment_id` (String), `process_name` (String), `description` (Text), `process_owner_name` (String), `criticality_level` (Enum [CRITICAL, HIGH, MEDIUM, LOW]), `mtpd_hours` (Decimal), `rto_hours` (Decimal), `rpo_hours` (Decimal), `mbco_percent` (Int).
- **`bia_impact_ratings`**: `id` (UUID), `process_id` (String), `impact_category` (Enum), `time_interval_hours` (Int), `severity_score` (Int 1-5).
- **`bia_dependencies`**: `id` (UUID), `process_id` (String), `dependency_type` (Enum), `resource_name` (String), `criticality` (String), `has_alternative` (Boolean), `alternative_description` (Text).
- **`bia_recovery_strategies`**: `id` (UUID), `process_id` (String), `strategy_phase` (Enum), `strategy_description` (Text).
- **`bia_risk_links`**: `id` (UUID), `process_id` (String), `risk_id` (String), `link_type` (String).
- **`bia_workflow_steps`**: `id` (UUID), `assessment_id` (String), `step_order` (Int), `approver_role` (Enum), `approver_id` (UUID), `decision` (Enum [PENDING, APPROVED, REJECTED, ESCALATED]), `comments` (Text), `deadline` (Timestamp), `sla_hours` (Int).

### National Resilience Index (Sumood)
- **`sumood_pillars`**: `id` (String), `name_ar` (String), `name_en` (String), `sort_order` (Int).
- **`sumood_components`**: `id` (String), `pillar_id` (String), `code` (String), `name_ar` (String), `name_en` (String).
- **`sumood_kpis`**: `id` (String), `component_id` (String), `kpi_code` (String), `kpi_text_ar` (Text), `weight` (Decimal), `is_applicable` (Boolean).
- **`sumood_assessments`**: `id` (UUID), `kpi_id` (String), `department_id` (UUID), `fiscal_year` (Int), `maturity_level` (Int 1-7), `evidence_notes` (Text), `attachments` (JSONB).

### System Audit
- **`audit_log`**: `id` (BigUInt), `user_id` (UUID), `action` (String), `entity_type` (String), `entity_id` (String), `details` (JSONB), `ip_address` (String), `user_agent` (Text).


## 3. API Routes

| HTTP Method | Route Endpoint | Controller Module | Access Requirements |
|-------------|----------------|-------------------|---------------------|
| `GET`       | `/api/v1/health` | `server.js` | Public |
| **Auth**    |
| `POST`      | `/api/v1/auth/login` | `routes/auth.js` | Public |
| `POST`      | `/api/v1/auth/refresh` | `routes/auth.js` | Authenticated |
| `GET`       | `/api/v1/auth/me`  | `routes/auth.js` | Authenticated |
| **Risks**   |
| `GET`       | `/api/v1/risks/` | `routes/risks.js` | `VIEW_RISKS` |
| `GET`       | `/api/v1/risks/matrix` | `routes/risks.js` | `VIEW_RISKS` |
| `GET`       | `/api/v1/risks/:id` | `routes/risks.js` | `VIEW_RISKS` |
| `POST`      | `/api/v1/risks/` | `routes/risks.js` | `MANAGE_RISKS` |
| `PATCH`     | `/api/v1/risks/:id` | `routes/risks.js` | `MANAGE_RISKS` |
| `DELETE`    | `/api/v1/risks/:id` | `routes/risks.js` | `MANAGE_RISKS` |
| `POST`      | `/api/v1/risks/:id/treatments` | `routes/risks.js` | `MANAGE_RISKS` |
| `GET`       | `/api/v1/risks/:id/audit-trail` | `routes/risks.js` | `VIEW_RISKS` |
| **BIA**     |
| `GET`       | `/api/v1/bia/assessments` | `routes/bia.js` | `VIEW_BIA` |
| `POST/PATCH`| `/api/v1/bia/assessments` | `routes/bia.js` | `MANAGE_BIA` |
| `GET/POST`  | `/api/v1/bia/processes` | `routes/bia.js` | `VIEW_BIA` / `MANAGE_BIA` |
| `GET/PUT`   | `/api/v1/bia/impact-ratings/:id` | `routes/bia.js` | `VIEW_BIA` / `MANAGE_BIA` |
| `GET/POST`  | `/api/v1/bia/dependencies` | `routes/bia.js` | `VIEW_BIA` / `MANAGE_BIA` |
| `GET/POST`  | `/api/v1/bia/recovery-strategies` | `routes/bia.js` | `VIEW_BIA` / `MANAGE_BIA` |
| `GET/POST`  | `/api/v1/bia/risk-links` | `routes/bia.js` | `VIEW_BIA` / `MANAGE_BIA` |
| `POST`      | `/api/v1/bia/consolidate/:year` | `routes/bia.js` | `MANAGE_BIA`, `APPROVE_BIA` |
| **Sumood**  |
| `GET`       | `/api/v1/sumood/pillars` | `routes/sumood.js` | `VIEW_SUMOOD` |
| `GET`       | `/api/v1/sumood/kpis/:id` | `routes/sumood.js` | `VIEW_SUMOOD` |
| `POST`      | `/api/v1/sumood/assess` (and `/batch`) | `routes/sumood.js` | `MANAGE_SUMOOD` |
| `GET`       | `/api/v1/sumood/scores/:dept/:year` | `routes/sumood.js` | `VIEW_SUMOOD` |
| `GET`       | `/api/v1/sumood/gap-analysis/:dept/:year` | `routes/sumood.js` | `VIEW_SUMOOD` |
| **Workflow**|
| `POST`      | `/api/v1/workflow/submit/:asmId` | `routes/workflow.js`| `MANAGE_BIA` |
| `POST`      | `/api/v1/workflow/approve/:stepId` | `routes/workflow.js`| `APPROVE_BIA` |
| `POST`      | `/api/v1/workflow/reject/:stepId` | `routes/workflow.js`| `APPROVE_BIA` |
| `GET`       | `/api/v1/workflow/:asmId` | `routes/workflow.js`| `VIEW_BIA` |
| `POST`      | `/api/v1/workflow/escalate` | `routes/workflow.js`| `MANAGE_BIA` |
| **Reports** |
| `GET`       | `/api/v1/reports/risk-register/pdf` | `routes/reports.js` | `EXPORT_REPORTS` |
| `GET`       | `/api/v1/reports/risk-register/excel` | `routes/reports.js` | `EXPORT_REPORTS` |
| `GET`       | `/api/v1/reports/bia-consolidated/pdf`| `routes/reports.js` | `EXPORT_REPORTS` |
| `GET`       | `/api/v1/reports/sumood-dashboard/pdf`| `routes/reports.js` | `EXPORT_REPORTS` |
| **Audit**   |
| `GET`       | `/api/v1/audit` | `routes/audit.js` | `VIEW_REPORTS` |


## 4. Models/Entities & Fields Breakdown

The project uses raw SQL with Knex.js migrations serving as the definitive description of models. The primary entities map 1:1 with the DB Schema outlined in Section 2. Important structural choices include:
1. **Risks**: Uses business-oriented IDs (`RSK-XXXX`), explicit fields for "inherent vs. residual" risks, integrated Treatment Plan mapping, and a comprehensive Audit Trail snapshotting (`old_value` and `new_value`).
2. **BIA Components**: A normalized relationship linking Assessments -> Processes -> (Dependencies, Impacts, Recovery Strategies, Risk Links).
3. **Workflow Logic**: Separated out to track individual approval steps and SLAs per Assessment.
4. **Sumood Matrix**: Static hierarchical taxonomy (`Pillars` -> `Components` -> `KPIs`) applied to yearly departmental assessments.


## 5. Configuration Files Content

**`vite.config.js`**
React integration and proxy config to Express backend (`http://localhost:3001` mapped to `/api`).

**`tailwind.config.js`**
CSS-variable based styling integrating a custom dark mode strategy (`[data-theme="dark"]`).

**`server/package.json`**
Defines the `grc-platform-server`, running Express, using `bcryptjs` for hashing, `jsonwebtoken`, `pdfkit`/`exceljs` for reports, and `knex`/`pg` for database logic.

**`server/knexfile.cjs`**
Basic configuration specifying Postgres client (`pg`), referencing `process.env.DATABASE_URL` with directories for `migrations` and `seeds`.

**`server/.env.example`**
Defines required environments: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `PORT`.


## 6. Business Logic & Workflow Functionality

**Risk Management Logic (`routes/risks.js`)**
- Calculates inherent/residual scores systematically (Score = Likelihood * Impact) using pre-defined bands (Very Low, Low, Medium, High, Catastrophic).
- Generates categorized Risk Matrix dynamically (`matrix` endpoint).
- Maintains strict immutability logging (`risk_audit_trail`) tracking per-field `PATCH` modifications.

**Business Impact Analysis (BIA) & Compliance (`routes/bia.js`)**
- Programmatic validations matching ISO 22301 strictures (verifying `RTO_hours < MTPD_hours`, `RPO_hours <= RTO_hours`).
- Centralized reporting API (`/consolidate`) capable of determining overarching organizational Minimum RTO/MTPD parameters, sorting recovery priority, and counting `Single Points of Failure (SPOF)` mathematically based on dependencies flagged `CRITICAL` with no alternative.

**National Resilience Index / Sumood Analytics (`routes/sumood.js`)**
- Utilizes an Assessment scaling factor of 1 to 7 maturity matrix index per KPI.
- Aggregates up Hierarchy (Weighted KPIs -> Component Averages -> Pillar Averages -> Organizational Total Maturity).
- Includes Gap-Analysis logic comparing target thresholds vs current, dynamically attributing severity levels (Requires Urgent Intervention vs Good Posture) depending on score delta.

**Workflow Approvals / BCP Lifecycles (`routes/workflow.js`)**
- Models State Machines for BIA Approval Lifecycles safely mapping the internal RBAC list (`DEPT_HEAD -> BC_COORDINATOR -> CISO -> CEO`).
- Incorporates SLA limits (`sla_hours: 120`).
- Provides an automated Cron-compatible endpoint (`/escalate`) capable of bypassing/overriding pending approvers whose deadlines have lapsed.
