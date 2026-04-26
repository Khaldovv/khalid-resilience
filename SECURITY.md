# Security Policy — JAHIZIA

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | ✅ Active |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email: **security@jahizia.sa**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 24 hours |
| Initial assessment | Within 48 hours |
| Fix development | Within 7 days (critical) |
| Disclosure | After fix is deployed |

## Security Measures

### Authentication & Access Control
- JWT with configurable expiry
- TOTP-based MFA (optional per user)
- 8-tier RBAC (ADMIN → VIEWER)
- Account lockout after 10 failed attempts
- Rate limiting on auth endpoints (15/15min)

### Data Protection
- Password hashing: bcrypt (12 rounds)
- Password policy: 12+ chars, mixed case, digits, special
- Input sanitization: XSS prevention on all endpoints
- Immutable audit logs: PostgreSQL triggers prevent modification
- SQL injection prevention: Knex.js parameterized queries

### Infrastructure
- Helmet.js HTTP security headers
- CORS origin whitelist
- 10MB request body limit
- File upload restrictions (PDF, DOCX, XLSX, TXT only)
- 50MB file size limit

### Compliance
- ISO 27001:2022 aligned controls
- NCA ECC cybersecurity requirements
- PDPL data protection compliance
- Full audit trail on all data mutations

## Responsible Disclosure

We follow a coordinated disclosure process and may offer acknowledgment in our security hall of fame for responsibly reported vulnerabilities.
