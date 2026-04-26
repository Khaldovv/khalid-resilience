# API Reference — JAHIZIA

**Base URL:** `http://localhost:3001/api/v1`
**Interactive Docs:** http://localhost:3001/api/docs (Swagger UI)

## Authentication

All endpoints require a JWT Bearer token unless marked `[PUBLIC]`.

```
Authorization: Bearer eyJhbGci...
```

### Get a Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@grc.sa", "password": "Admin@2026"}'
```

Response:
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "role": "ADMIN", "permissions": ["*"] }
}
```

## Endpoints Summary

### Health `[PUBLIC]`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/health/db` | Database connectivity |
| GET | `/api/health/ai` | OpenRouter reachability |
| GET | `/api/health/all` | Aggregated health status |

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login (supports MFA) |
| POST | `/auth/refresh` | Refresh JWT |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/mfa/setup` | Generate MFA QR + backup codes |
| POST | `/auth/mfa/verify` | Verify and enable MFA |
| POST | `/auth/mfa/disable` | Disable MFA (requires password) |
| POST | `/auth/change-password` | Change password (policy enforced) |

### Risks (ISO 31000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/risks` | List with filters/pagination |
| GET | `/risks/matrix` | 5×5 risk matrix aggregation |
| GET | `/risks/:id` | Risk detail + treatments + audit trail |
| POST | `/risks` | Create risk |
| PATCH | `/risks/:id` | Update risk (field-level audit) |
| DELETE | `/risks/:id` | Archive risk (soft delete) |
| POST | `/risks/:id/treatments` | Add treatment plan |
| GET | `/risks/:id/audit-trail` | Change history |
| POST | `/risks/:id/simulate` | AI scenario simulation |
| GET | `/risks/:id/simulations` | Past simulations |

### BIA (ISO 22301)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bia/assessments` | List assessments |
| POST | `/bia/assessments` | Create assessment |
| GET | `/bia/processes` | List processes |
| POST | `/bia/processes` | Create process (RTO<MTPD validated) |
| PUT | `/bia/impact-ratings/:processId` | Bulk upsert impact ratings |
| POST | `/bia/consolidate/:year` | Generate consolidated report |

### Vendors (TPRM)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/vendors` | List with latest risk tier |
| POST | `/vendors` | Create vendor |
| POST | `/vendors/:id/assessments` | Add 6-dimension assessment |
| GET | `/vendors/dashboard` | TPRM dashboard stats |

### Incidents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/incidents` | List with filters |
| POST | `/incidents` | Create incident |
| POST | `/incidents/:id/timeline` | Add timeline event |
| PATCH | `/incidents/:id/status` | Change status (auto timestamps) |
| POST | `/incidents/:id/review` | Post-incident review |

### Quantification (Monte Carlo)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/quantification/simulate/:riskId` | Run 10K Monte Carlo |
| GET | `/quantification/:riskId` | Get results |
| POST | `/quantification/portfolio/:year` | Portfolio simulation |

### AI Intelligence

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/conversations` | Create conversation |
| POST | `/ai/conversations/:id/message` | Send message, get AI reply |
| POST | `/ai/generate-risks` | AI risk generation |
| POST | `/ai/analyze/risks` | On-demand risk scan |

## Error Format

All errors return:
```json
{
  "error": "Arabic error message",
  "error_en": "English error message",
  "details": ["Specific validation issue 1", "..."]
}
```

## Pagination

List endpoints support:
```
?page=1&per_page=25&sort_by=created_at&sort_dir=desc
```

Response:
```json
{
  "data": [...],
  "pagination": { "page": 1, "per_page": 25, "total": 142 }
}
```
