# Khalid Resilience — Enterprise GRC Platform

> AI-powered Governance, Risk & Compliance platform for Saudi government and institutional clients.
> Bilingual: Arabic (RTL) + English (LTR) — native, not translated.

[![Status: Beta](https://img.shields.io/badge/status-beta-yellow.svg)]()
[![Node.js: 18+](https://img.shields.io/badge/node-18%2B-green.svg)]()
[![PostgreSQL: 14+](https://img.shields.io/badge/postgres-14%2B-blue.svg)]()

## ✨ Features

- 🎯 **Risk Management** — ISO 31000 compliant 5×5 matrix with AI-powered scenario simulation
- 📊 **Business Impact Analysis** — Full BIA workflow with 4-level approval pipeline + Asset Registry (ISO 22301 §8.2.2)
- 🇸🇦 **Sumood National Resilience Index** — 113 KPIs across 5 pillars with AI document compliance analysis
- 🤝 **Third-Party Risk Management** — Vendor assessments with 6-dimension scoring and SLA tracking
- 🚨 **Incident Management** — Full lifecycle (Detect → Contain → Eradicate → Recover → Lessons Learned)
- 💰 **Risk Quantification** — Monte Carlo simulations (10K+ iterations, PERT distribution)
- 📜 **Regulatory Intelligence** — NCA, SAMA, DGA, NDMO, SDAIA, CMA tracking with compliance calendars
- 🤖 **AI Risk Intelligence Agent** — Conversational AI with full platform context and predictive insights
- 🔐 **MFA Authentication** — TOTP-based multi-factor authentication with backup codes
- 📈 **Executive Briefing** — CEO-level dashboard with AI-generated summaries
- 🌐 **Native Bilingual** — Arabic (RTL) + English (LTR)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Express.js 4, Knex.js 3, JWT, Helmet, Winston |
| Database | PostgreSQL 14+ (42 tables, 30+ indexes, immutability triggers) |
| AI | OpenRouter → Qwen 2.5 72B, DeepSeek V3, Llama 3.3 70B |
| Security | bcrypt, TOTP MFA (speakeasy), rate limiting, XSS sanitization |
| Docs | Swagger/OpenAPI 3.0 at `/api/docs` |

## 📋 Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **OpenRouter API key** — [Get one free](https://openrouter.ai/keys)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> khalid-resilience
cd khalid-resilience
npm install
cd server && npm install && cd ..
```

### 2. Database Setup

```bash
# Create the database
createdb grc_platform

# Copy and configure environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL, JWT_SECRET, and OPENROUTER_API_KEY

# Run all migrations (creates 42 tables)
cd server
npx knex migrate:latest

# Seed initial data (departments, users, sample risks, Sumood KPIs)
npx knex seed:run
cd ..
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend API (port 3001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

### 4. Access

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend app |
| http://localhost:3001/api/health | Health check |
| http://localhost:3001/api/docs | Swagger API docs |

### 5. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@grc.sa | Admin@2026 |
| CRO | cro@grc.sa | Admin@2026 |
| CISO | ciso@grc.sa | Admin@2026 |
| Dept Head | depthead@grc.sa | Admin@2026 |
| BC Coordinator | bc@grc.sa | Admin@2026 |
| Analyst | analyst@grc.sa | Admin@2026 |

> ⚠️ **Change all passwords immediately in production!**

## 📁 Project Structure

```
khalid-resilience/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # Reusable UI components
│   │   ├── bia/                # BIA-specific components
│   │   ├── risk/               # Risk detail, edit, simulation
│   │   ├── sumood/             # Sumood dashboard, assessment
│   │   ├── dashboard/          # Executive dashboard panels
│   │   ├── incidents/          # Post-incident review
│   │   └── tprm/               # Vendor management forms
│   ├── pages/                  # Route-level page components
│   │   └── admin/              # Admin pages (AI dashboard)
│   ├── context/                # React Context providers (9 contexts)
│   ├── services/               # API client, mock services
│   ├── data/                   # Translations (316 keys), mock data
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Risk scoring, export helpers
├── server/                     # Backend (Express.js)
│   ├── routes/                 # API route handlers (16 files, ~100 endpoints)
│   ├── services/               # Business logic layer
│   │   └── ai/                 # Unified AI service (OpenRouter)
│   ├── middleware/             # Auth, audit, sanitization, upload
│   ├── migrations/             # Database schema (015 files)
│   ├── seeds/                  # Initial data
│   ├── config/                 # DB, auth, logger, swagger
│   ├── utils/                  # Password validation
│   ├── jobs/                   # AI cost monitoring
│   └── logs/                   # Winston log output (gitignored)
├── docs/                       # Architecture & deployment docs
├── PROJECT_AUDIT.md            # Full codebase audit report
├── SECURITY.md                 # Security policy
└── CONTRIBUTING.md             # Contribution guidelines
```

## 🔐 Security Features

- **JWT Authentication** with configurable expiry
- **TOTP MFA** with QR code setup and backup codes
- **Rate Limiting** — 15 login attempts per 15 minutes
- **Account Lockout** — 10 failed attempts locks for 1 hour
- **Password Policy** — 12+ chars, mixed case, digits, special chars
- **Input Sanitization** — XSS prevention on all endpoints
- **Immutable Audit Logs** — PostgreSQL triggers prevent modification
- **RBAC** — 8 roles with granular permission mapping

## 📊 Compliance

Designed to support:

- ✅ ISO 31000:2018 — Risk Management
- ✅ ISO 22301:2019 — Business Continuity Management
- ✅ ISO 27001:2022 — Information Security Management
- ✅ NCA ECC — Saudi National Cybersecurity Authority
- ✅ SAMA BCM — Saudi Central Bank Business Continuity
- ✅ NDMO SUMOOD — National Data Management Office Resilience Index
- ✅ PDPL — Saudi Personal Data Protection Law
- ✅ COSO ERM Framework

## 📖 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Policy](./SECURITY.md)
- [Contributing](./CONTRIBUTING.md)
- [Project Audit](./PROJECT_AUDIT.md)

## 📜 License

Proprietary © 2026 Khalid Alghofaili. All rights reserved.

---

**Built with ❤️ for Saudi Vision 2030 resilience initiatives**
