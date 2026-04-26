require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/database');
const logger = require('./config/logger');

// ── Route imports ──────────────────────────────────────────────────────────────
const healthRoutes         = require('./routes/health');
const authRoutes           = require('./routes/auth');
const riskRoutes           = require('./routes/risks');
const biaRoutes            = require('./routes/bia');
const sumoodRoutes         = require('./routes/sumood');
const workflowRoutes       = require('./routes/workflow');
const reportRoutes         = require('./routes/reports');
const auditRoutes          = require('./routes/audit');
const aiRoutes             = require('./routes/ai');
const vendorRoutes         = require('./routes/vendors');
const incidentRoutes       = require('./routes/incidents');
const quantificationRoutes = require('./routes/quantification');
const regulatoryRoutes     = require('./routes/regulatory');
const biaAssetRoutes       = require('./routes/biaAssets');
const adminAIRoutes        = require('./routes/adminAI');
const bcpRoutes            = require('./routes/bcp');
const notificationRoutes   = require('./routes/notifications');

const sanitizeInputs = require('./middleware/sanitizeInputs');
const demoGuard = require('./middleware/demoGuard');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Sentry (optional — only initializes if DSN is configured) ──────────────────
let Sentry;
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    logger.info('Sentry error tracking initialized');
  } catch {
    logger.warn('Sentry package not installed — error tracking disabled');
  }
}

// ── Global Middleware ──────────────────────────────────────────────────────────
app.set('trust proxy', 1); // Railway/Vercel use reverse proxies
app.use(helmet());
// ── CORS — flexible for dev/staging/production ────────────────────────────────
const allowedOrigins = [
  // Local development
  'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000',
  // Production — jahizia.com (primary)
  'https://jahizia.com', 'https://www.jahizia.com',
  // Production — khalidresilience.com (legacy, kept during transition)
  'https://khalidresilience.com', 'https://www.khalidresilience.com',
  'http://khalidresilience.com', 'http://www.khalidresilience.com',
  // Environment variable override
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow Vercel preview domains
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    // Allow jahizia.com and khalidresilience.com custom domains
    if (/^https?:\/\/(www\.)?jahizia\.com$/.test(origin)) return callback(null, true);
    if (/^https?:\/\/(www\.)?khalidresilience\.com$/.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP request logging via Winston stream
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => req.url.startsWith('/api/health'),
}));

app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInputs); // Red Team Fix: XSS + length sanitization

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  message: {
    error: 'تجاوزت عدد المحاولات. حاول بعد 15 دقيقة.',
    error_en: 'Too many attempts. Try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute per IP
  message: {
    error: 'تجاوزت حد الطلبات. حاول لاحقاً.',
    error_en: 'Rate limit exceeded. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/mfa/verify', authLimiter);
app.use('/api/v1', apiLimiter);

// ── Swagger API Docs ──────────────────────────────────────────────────────────
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'JAHIZIA API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));
  logger.info('Swagger API docs available at /api/docs');
} catch (err) {
  logger.warn('Swagger setup failed — API docs disabled', { error: err.message });
}

// ── Health Checks (public — no auth) ──────────────────────────────────────────
app.use('/api', healthRoutes);

// ── Demo Guard (applied globally — only affects users with isDemo flag) ───────
app.use('/api/v1', demoGuard);

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',           authRoutes);
app.use('/api/v1/risks',          riskRoutes);
app.use('/api/v1/bia',            biaRoutes);
app.use('/api/v1/sumood',         sumoodRoutes);
app.use('/api/v1/workflow',       workflowRoutes);
app.use('/api/v1/reports',        reportRoutes);
app.use('/api/v1/audit',          auditRoutes);
app.use('/api/v1/ai',             aiRoutes);
app.use('/api/v1/vendors',        vendorRoutes);
app.use('/api/v1/incidents',      incidentRoutes);
app.use('/api/v1/quantification', quantificationRoutes);
app.use('/api/v1/regulatory',     regulatoryRoutes);
app.use('/api/v1/bia/assets',     biaAssetRoutes);
app.use('/api/v1/admin/ai',       adminAIRoutes);
app.use('/api/v1/bcp',            bcpRoutes);
app.use('/api/v1/notifications',  notificationRoutes);

// ── Sumood Compliance (import with catch in case file upload deps missing) ─────
try {
  const sumoodComplianceRoutes = require('./routes/sumoodCompliance');
  app.use('/api/v1/sumood-compliance', sumoodComplianceRoutes);
} catch (err) {
  logger.warn('Sumood compliance routes failed to load', { error: err.message });
}

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// ── Sentry Error Handler (must be before global handler) ──────────────────────
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
  });

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Auto-migration on startup ─────────────────────────────────────────────────
const startServer = async () => {
  try {
    logger.info('[DB] Testing database connection...');
    await db.raw('SELECT 1');
    logger.info('[DB] Database connected successfully');

    // Force-release any stale migration lock
    try {
      await db.migrate.forceFreeMigrationsLock();
      logger.info('[DB] Migration lock released');
    } catch (lockErr) {
      logger.info('[DB] No migration lock to release');
    }

    logger.info('[DB] Running pending migrations...');
    const [batchNo, migrationLog] = await db.migrate.latest();
    if (migrationLog.length > 0) {
      logger.info(`[DB] Batch ${batchNo}: ran ${migrationLog.length} migrations`, { migrations: migrationLog });
    } else {
      logger.info('[DB] No pending migrations');
    }

    // Auto-seed if database is empty
    const userCount = await db('users').count('id as c').first();
    if (parseInt(userCount?.c || 0) === 0) {
      logger.info('[DB] No data found — running seeds...');
      await db.seed.run();
      logger.info('[DB] Seeds complete');
    }
  } catch (err) {
    logger.error('[DB] Migration/seed error:', { error: err.message, stack: err.stack });
  }

  app.listen(PORT, () => {
    logger.info(`GRC Platform API Server started`, {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      health: `http://localhost:${PORT}/api/health`,
      docs: `http://localhost:${PORT}/api/docs`,
    });
  });
};

startServer();

module.exports = app;
