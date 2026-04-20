# Deployment Guide — Khalid Resilience

## Recommended Stack

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend | Vercel | Free tier works for beta |
| Backend | Railway | Auto-deploy from GitHub |
| Database | Railway PostgreSQL | Managed, auto-backups |
| AI | OpenRouter | Pay-per-token, no GPU needed |

## Environment Variables Checklist

Before deploying, ensure ALL of these are set:

### Backend (Railway / server)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Strong random string (32+ chars) |
| `JWT_EXPIRY` | ✅ | Token lifetime (e.g., `8h`) |
| `OPENROUTER_API_KEY` | ✅ | AI provider key |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ⬜ | Default: 3001 |
| `LOG_LEVEL` | ⬜ | Default: `info` |
| `CORS_ORIGINS` | ✅ | Frontend URL(s) |
| `APP_URL` | ⬜ | For OpenRouter referer |
| `SENTRY_DSN` | ⬜ | Error tracking |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_SENTRY_DSN` | ⬜ | Frontend error tracking |

## Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://your-railway-backend.up.railway.app
```

Ensure `vercel.json` is configured for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Deploy to Railway (Backend)

1. Connect your GitHub repo to Railway
2. Set the root directory to `server/`
3. Add all environment variables
4. Railway auto-detects Node.js and runs `npm start`

### Database Migration

After first deploy:
```bash
railway run npx knex migrate:latest
railway run npx knex seed:run
```

## Production Hardening Checklist

- [ ] Generate strong `JWT_SECRET` (`openssl rand -base64 32`)
- [ ] Change all default user passwords
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` to exact frontend domain
- [ ] Enable MFA for admin accounts
- [ ] Set up Sentry for error tracking
- [ ] Configure log rotation retention
- [ ] Set up database backups (Railway auto-backups)
- [ ] Test health endpoints: `GET /api/health/all`
- [ ] Verify rate limiting is active

## SSL/TLS

Both Vercel and Railway provide automatic HTTPS. No additional configuration needed.

## Monitoring

- **Health:** `GET /api/health/all` — returns healthy/degraded + latency
- **Logs:** Winston writes to `server/logs/` (daily rotation, 30-day retention)
- **Errors:** Sentry (if configured) captures unhandled exceptions
- **AI Costs:** `aiCostMonitor.js` tracks daily spend (400 SAR/month threshold)
