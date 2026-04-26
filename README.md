# JAHIZIA — جاهزية

**AI-Powered Enterprise Risk & Resilience Platform**

> منصة الذكاء الاصطناعي لإدارة المخاطر والمرونة المؤسسية — متوافقة مع المعايير السعودية والدولية

---

## Overview

JAHIZIA is a bilingual (Arabic/English) AI-powered GRC platform built for Saudi enterprises. It provides comprehensive risk management, business impact analysis, business continuity planning, and regulatory compliance capabilities aligned with international and Saudi standards.

### Standards Compliance

| Standard | Coverage |
|----------|----------|
| ISO 31000:2018 | Enterprise Risk Management |
| ISO 22301:2019 | Business Continuity Management |
| NCA ECC | Saudi Cybersecurity Controls |
| SAMA BCM | Financial Sector BCM |
| NDMO SUMOOD | National Resilience Index |

## Key Features

- **Risk Register** — ISO 31000 compliant risk lifecycle management with 5×5 matrix
- **Business Impact Analysis (BIA)** — Multi-cycle assessment with RTO/RPO/MTPD tracking
- **Business Continuity Plans (BCP)** — Auto-generated ISO 22301 compliant DOCX documents
- **AI Risk Intelligence Agent** — Bilingual AI assistant for risk analysis
- **SUMOOD Assessment** — NDMO national resilience self-assessment
- **Executive Briefing** — CEO-level dashboard with KPIs
- **SOP Playbooks** — Standard operating procedures for crisis management
- **Monte Carlo Simulation** — Quantitative risk analysis
- **Vendor Risk Management** — Third-party risk assessment
- **Incident Management** — Incident tracking and response
- **Regulatory Intelligence** — Compliance monitoring

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS + Custom CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Knex.js |
| Auth | JWT + bcrypt + MFA (TOTP) |
| AI | OpenRouter (GPT-4, Claude) |
| Docs | docx.js + FileSaver |
| Charts | Recharts |

## Getting Started

```bash
git clone <repo-url> jahizia
cd jahizia

# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd server
npm install
npm run dev
```

## Environment Variables

```env
# Backend (.env in /server)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
OPENROUTER_API_KEY=your-key
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
jahizia/
├── public/brand/          # Logo SVGs (navy, white, mono)
├── src/
│   ├── components/
│   │   ├── brand/         # Logo component
│   │   ├── risk/          # Risk management
│   │   ├── bia/           # Business impact analysis
│   │   └── ...
│   ├── pages/             # Main views
│   ├── context/           # App + Auth contexts
│   ├── data/              # Translations
│   └── utils/             # Export utilities
├── server/
│   ├── routes/            # API endpoints
│   ├── services/          # BCP document generation
│   ├── config/            # DB, Auth, Swagger
│   └── migrations/        # Database schema
└── index.html
```

## License

Proprietary — © 2026 JAHIZIA. All rights reserved.

---

*Built for Saudi Vision 2030 🇸🇦*
